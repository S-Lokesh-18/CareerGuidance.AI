import { predictCareersWithKNN } from './mlService.js';
import { generateJSON } from './aiService.js';
import { z } from 'zod';

const ExplanationsSchema = z.object({
  explanations: z.array(
    z.object({
      careerTitle: z.string(),
      explanation: z.string(),
      highlightSkills: z.array(z.string()),
    })
  )
});

/**
 * Computes weighted skill & interest match percentage for a single career
 */
export function calculateWeightedMatch(career, userSkills = {}, userInterests = []) {
  const requiredSkills = Array.isArray(career.required_skills)
    ? career.required_skills
    : JSON.parse(career.required_skills || '[]');

  let totalWeightPoints = 0;
  let earnedSkillPoints = 0;

  requiredSkills.forEach((req) => {
    const weight = Number(req.weight) || 3;
    const maxSkillPoint = weight * 5;
    totalWeightPoints += maxSkillPoint;

    // Check user rating for this skill
    let userRating = 0;
    const reqName = req.skill.toLowerCase();

    for (const [sName, rating] of Object.entries(userSkills)) {
      const lower = sName.toLowerCase();
      if (lower === reqName || lower.includes(reqName) || reqName.includes(lower)) {
        userRating = Math.max(userRating, Number(rating) || 0);
      }
    }

    earnedSkillPoints += weight * Math.min(5, Math.max(0, userRating));
  });

  const skillScore = totalWeightPoints > 0 ? (earnedSkillPoints / totalWeightPoints) * 100 : 0;

  // Interest tags overlap
  let interestScore = 0;
  const careerInterests = Array.isArray(career.interest_tags)
    ? career.interest_tags
    : JSON.parse(career.interest_tags || '[]');

  if (userInterests && userInterests.length > 0 && careerInterests.length > 0) {
    const normalizedUserInterests = userInterests.map((i) => i.toLowerCase().trim());
    let matchCount = 0;

    careerInterests.forEach((tag) => {
      const tagLower = tag.toLowerCase().trim();
      const hasMatch = normalizedUserInterests.some(
        (ui) => ui.includes(tagLower) || tagLower.includes(ui)
      );
      if (hasMatch) matchCount++;
    });

    interestScore = Math.min(100, (matchCount / careerInterests.length) * 100);
    // Blend: 85% skill alignment, 15% interest alignment
    return Math.round(skillScore * 0.85 + interestScore * 0.15);
  }

  return Math.round(skillScore);
}

/**
 * Matches user against all careers in the database, blends with ML predictions,
 * and fetches Gemini explanations for top 3 careers.
 */
export async function matchCareers({ careers, userSkills = {}, userInterests = [], education = '' }) {
  // 1. Compute rule-based weighted match percentage for every career
  const weightedMatches = careers.map((career) => {
    const score = calculateWeightedMatch(career, userSkills, userInterests);
    return {
      careerId: career.id,
      title: career.title,
      description: career.description,
      salaryRange: career.salary_range,
      demandLevel: career.demand_level,
      requiredSkills: career.required_skills,
      interestTags: career.interest_tags,
      weightedScore: score,
    };
  });

  // 2. Compute k-NN machine learning predictions
  const mlResult = predictCareersWithKNN(userSkills);
  const mlScoreMap = new Map();
  mlResult.predictions.forEach((p) => {
    mlScoreMap.set(p.career.toLowerCase(), p.mlScore);
  });

  // 3. Blend scores: 60% Weighted Match, 40% ML Classifier
  const blendedCareers = weightedMatches.map((career) => {
    const mlScore = mlScoreMap.get(career.title.toLowerCase()) || 20;
    const finalScore = Math.round(career.weightedScore * 0.60 + mlScore * 0.40);

    return {
      ...career,
      mlScore,
      finalScore: Math.min(100, Math.max(0, finalScore)),
    };
  });

  // Sort by finalScore descending
  blendedCareers.sort((a, b) => b.finalScore - a.finalScore);

  // 4. Generate AI explanations for top 3 careers
  const top3 = blendedCareers.slice(0, 3);
  const top3Summary = top3.map((c) => ({
    title: c.title,
    score: c.finalScore,
    userStrongSkills: Object.entries(userSkills)
      .filter(([_, val]) => Number(val) >= 4)
      .map(([k]) => k),
  }));

  const fallbackExplanations = top3.map((c) => ({
    careerTitle: c.title,
    explanation: `Your skills and interests show strong compatibility with ${c.title} (${c.finalScore}% match). Your foundation aligns with its core competencies, and focused practice will help you excel.`,
    highlightSkills: Array.isArray(c.requiredSkills)
      ? c.requiredSkills.slice(0, 3).map((s) => s.skill)
      : ['Core fundamentals']
  }));

  let explanations = fallbackExplanations;

  const prompt = `You are a supportive career guidance counselor.
The student has evaluated their skills and education background:
- Education background: ${education || 'Not specified'}
- Top career recommendations (blended 60% weighted skill match + 40% k-NN ML classifier):
${JSON.stringify(top3Summary, null, 2)}

Provide encouraging, friendly, and practical 2-sentence explanations for each of the 3 careers explaining why they match the student.
Schema required:
{
  "explanations": [
    {
      "careerTitle": "Career Name",
      "explanation": "Friendly 2-sentence rationale.",
      "highlightSkills": ["Skill 1", "Skill 2"]
    }
  ]
}`;

  try {
    const aiResult = await generateJSON(prompt, ExplanationsSchema, { explanations: fallbackExplanations });
    if (aiResult?.explanations?.length) {
      explanations = aiResult.explanations;
    }
  } catch (err) {
    console.warn('Gemini explanation fallback activated:', err.message);
  }

  // Attach explanations to top 3
  const rankedWithExplanations = blendedCareers.map((c, idx) => {
    if (idx < 3) {
      const match = explanations.find(
        (e) => e.careerTitle.toLowerCase() === c.title.toLowerCase()
      ) || explanations[idx];
      return {
        ...c,
        aiExplanation: match?.explanation || fallbackExplanations[idx].explanation,
        highlightSkills: match?.highlightSkills || fallbackExplanations[idx].highlightSkills,
      };
    }
    return c;
  });

  return {
    topCareers: rankedWithExplanations,
    modelInsights: {
      testAccuracy: mlResult.testAccuracy,
      isSynthetic: mlResult.isSynthetic,
      modelNote: mlResult.modelNote,
      blendingRatio: '60% Weighted Skill Alignment, 40% k-NN Classifier',
    }
  };
}

export default {
  calculateWeightedMatch,
  matchCareers,
};
