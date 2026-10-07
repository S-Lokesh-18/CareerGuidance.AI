import { query } from '../config/db.js';
import { matchCareers } from '../services/matchService.js';

export async function submitAssessment(req, res, next) {
  try {
    const { education, interests, skills } = req.body;
    const userId = req.user.id;

    // Fetch all career profiles
    const careersRes = await query('SELECT * FROM careers');
    const careers = careersRes.rows;

    // Run blended matching (weighted 60% + ML 40% + Gemini explanation on top 3)
    const matchResult = await matchCareers({
      careers,
      userSkills: skills || {},
      userInterests: interests || [],
      education: education || '',
    });

    const answersPayload = {
      education: education || '',
      interests: interests || [],
      skills: skills || {},
    };

    const resultsPayload = {
      topCareers: matchResult.topCareers,
      modelInsights: matchResult.modelInsights,
    };

    const insertRes = await query(
      'INSERT INTO assessments (user_id, answers, results) VALUES ($1, $2, $3) RETURNING id, user_id, answers, results, created_at',
      [userId, JSON.stringify(answersPayload), JSON.stringify(resultsPayload)]
    );

    const record = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Assessment analyzed and saved successfully.',
      data: {
        assessmentId: record.id,
        answers: record.answers,
        results: record.results,
        createdAt: record.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getLatestAssessment(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, answers, results, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (result.rowCount === 0) {
      return res.json({
        success: true,
        message: 'No assessments completed yet.',
        data: null,
      });
    }

    const row = result.rows[0];
    return res.json({
      success: true,
      message: 'Latest assessment retrieved.',
      data: {
        assessmentId: row.id,
        answers: row.answers,
        results: row.results,
        createdAt: row.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserAssessments(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, answers, results, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.json({
      success: true,
      message: 'Assessment history retrieved.',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  submitAssessment,
  getLatestAssessment,
  getUserAssessments,
};
