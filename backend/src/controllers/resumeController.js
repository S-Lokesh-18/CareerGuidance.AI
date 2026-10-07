import multer from 'multer';
import pdfParse from 'pdf-parse';
import { z } from 'zod';
import { query } from '../config/db.js';
import { calculateCosineSimilarity, analyzeKeywords } from '../services/nlpService.js';
import { generateJSON } from '../services/aiService.js';

// Multer in-memory storage config (PDF only, 5MB max)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  },
});

const ResumeFeedbackSchema = z.object({
  overallSummary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  rewriteSuggestions: z.array(
    z.object({
      originalSectionOrBullet: z.string(),
      improvedVersion: z.string(),
      rationale: z.string(),
    })
  ),
  actionPlan: z.array(z.string()),
});

function getCuratedResumeFeedback(careerTitle, matchedKeywords, missingKeywords) {
  return {
    overallSummary: `Your resume demonstrates relevant experience and touches on several foundational elements for a ${careerTitle} role. Strategic optimization will significantly improve your industry alignment.`,
    strengths: [
      `Demonstrates familiarity with key technical concepts: ${matchedKeywords.slice(0, 3).join(', ') || 'General engineering foundations'}.`,
      'Presents structured professional and academic background clearly.',
      'Includes actionable project descriptions and technology mentions.'
    ],
    weaknesses: [
      `Missing emphasis on high-impact competencies: ${missingKeywords.slice(0, 4).join(', ') || 'Advanced systems architecture'}.`,
      'Bullet points could benefit from quantified metrics (e.g., % improvement, scale of users).',
      'Summary statement should more directly position your specific career objectives.'
    ],
    rewriteSuggestions: [
      {
        originalSectionOrBullet: 'Worked on web applications and fixed bugs.',
        improvedVersion: `Spearheaded development of responsive components using ${matchedKeywords[0] || 'modern frameworks'}, decreasing latency by 20% and improving user retention.`,
        rationale: 'Replaces passive verbs with active accomplishment metrics and specifies exact toolchains.'
      },
      {
        originalSectionOrBullet: 'Responsible for database queries and data analysis.',
        improvedVersion: `Architected and optimized SQL queries and data schemas, supporting analytics workflows for 500+ daily active users.`,
        rationale: 'Shows measurable scope and business value instead of generic duties.'
      }
    ],
    actionPlan: [
      `Incorporate projects featuring ${missingKeywords[0] || 'production tools'} to close key keyword gaps.`,
      'Standardize work experience bullets using the Action Verb + Context + Quantified Metric format.',
      'Tailor the executive summary to match target job descriptions directly.'
    ]
  };
}

export async function analyzeResume(req, res, next) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file (up to 5MB).',
        data: null,
      });
    }

    const { careerId, jobDescription } = req.body;

    // 1. Extract text from PDF buffer using pdf-parse
    let extractedText = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = (pdfData.text || '').trim();
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: 'Could not parse PDF. Ensure the file is not password-protected or corrupted.',
        data: null,
      });
    }

    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract selectable text from this PDF. Please ensure the document is not an image-only scan.',
        data: null,
      });
    }

    // 2. Fetch career details if provided
    let career = null;
    let expectedSkills = [];
    let targetComparisonText = jobDescription || '';

    if (careerId) {
      const careerRes = await query('SELECT * FROM careers WHERE id = $1', [careerId]);
      if (careerRes.rowCount > 0) {
        career = careerRes.rows[0];
        expectedSkills = Array.isArray(career.required_skills)
          ? career.required_skills
          : JSON.parse(career.required_skills || '[]');

        const skillNames = expectedSkills.map((s) => s.skill).join(' ');
        targetComparisonText = `${career.title}. ${career.description}. Required skills: ${skillNames}. ${targetComparisonText}`;
      }
    }

    const careerTitle = career ? career.title : 'Target Career';

    // 3. NLP Analysis: TF-IDF Cosine Similarity & Keyword Extraction
    const cosineSimilarity = calculateCosineSimilarity(extractedText, targetComparisonText);
    const keywordAnalysis = analyzeKeywords(extractedText, expectedSkills, jobDescription);

    // Compute "Match and readiness estimate" (never an ATS score)
    const matchedRatio = expectedSkills.length > 0
      ? keywordAnalysis.matchedKeywords.length / expectedSkills.length
      : 0.5;

    const rawScore = Math.round(cosineSimilarity * 45 + matchedRatio * 45 + 10);
    const readinessScore = Math.min(95, Math.max(15, rawScore));

    // 4. Gemini AI feedback generation (with fallback)
    const fallbackFeedback = getCuratedResumeFeedback(
      careerTitle,
      keywordAnalysis.matchedKeywords,
      keywordAnalysis.missingKeywords
    );

    let feedback = fallbackFeedback;

    // Notice: Never log the resume text as per security rules
    const prompt = `You are a professional technical recruiter and career coach.
Target Role: ${careerTitle}
Matched Keywords in Candidate's Resume: ${JSON.stringify(keywordAnalysis.matchedKeywords)}
Missing Keywords: ${JSON.stringify(keywordAnalysis.missingKeywords)}
Estimated Match Score: ${readinessScore}%

The candidate has submitted a resume with relevant background.
Analyze this resume and provide constructive feedback in JSON:
{
  "overallSummary": "Encouraging 2-sentence executive summary",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness/Gap 1", "Weakness/Gap 2", "Weakness/Gap 3"],
  "rewriteSuggestions": [
    {
      "originalSectionOrBullet": "A typical generic line from their resume type",
      "improvedVersion": "Quantified, high-impact version with strong action verbs",
      "rationale": "Why this revision works better"
    }
  ],
  "actionPlan": ["Immediate Next Step 1", "Step 2", "Step 3"]
}`;

    try {
      const aiResult = await generateJSON(prompt, ResumeFeedbackSchema, fallbackFeedback);
      if (aiResult?.strengths?.length) {
        feedback = aiResult;
      }
    } catch (err) {
      console.warn('AI feedback fallback used for resume analysis:', err.message);
    }

    // 5. Store in database
    const analysisPayload = {
      scoreLabel: 'Match and Readiness Estimate',
      disclaimer: 'This is an AI-driven readiness estimate and keyword alignment guide, not a real ATS score.',
      careerTitle,
      careerId: career ? career.id : null,
      cosineSimilarity: Number(cosineSimilarity.toFixed(3)),
      matchedKeywords: keywordAnalysis.matchedKeywords,
      missingKeywords: keywordAnalysis.missingKeywords,
      feedback,
    };

    const insertRes = await query(
      'INSERT INTO resume_analyses (user_id, file_name, match_score, result) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, req.file.originalname, readinessScore, JSON.stringify(analysisPayload)]
    );

    const record = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: {
        id: record.id,
        fileName: record.file_name,
        matchScore: record.match_score,
        result: record.result,
        createdAt: record.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getResumeHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, file_name, match_score, result, created_at FROM resume_analyses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.json({
      success: true,
      message: 'Resume analysis history retrieved.',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function getResumeById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'SELECT id, file_name, match_score, result, created_at FROM resume_analyses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found.',
        data: null,
      });
    }

    return res.json({
      success: true,
      message: 'Resume analysis retrieved.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

export default {
  upload,
  analyzeResume,
  getResumeHistory,
  getResumeById,
};
