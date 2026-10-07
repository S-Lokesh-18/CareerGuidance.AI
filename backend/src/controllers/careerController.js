import { query } from '../config/db.js';
import { analyzeSkillGap } from '../services/skillGapService.js';
import { forecastDemandForSkills } from '../services/mlService.js';

export async function getAllCareers(req, res, next) {
  try {
    const result = await query(
      'SELECT id, title, description, required_skills, interest_tags, salary_range, demand_level FROM careers ORDER BY title ASC'
    );
    return res.json({
      success: true,
      message: 'Careers retrieved successfully.',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCareerById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, title, description, required_skills, interest_tags, salary_range, demand_level FROM careers WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Career profile not found.',
        data: null,
      });
    }

    return res.json({
      success: true,
      message: 'Career profile retrieved.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

export async function getCareerSkillGap(req, res, next) {
  try {
    const { id } = req.params;
    const careerRes = await query('SELECT * FROM careers WHERE id = $1', [id]);

    if (careerRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Career profile not found.',
        data: null,
      });
    }

    const career = careerRes.rows[0];
    let userSkills = {};

    // If user is authenticated, check for their latest assessment
    if (req.user?.id) {
      const assessmentRes = await query(
        'SELECT answers FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
      if (assessmentRes.rowCount > 0 && assessmentRes.rows[0].answers?.skills) {
        userSkills = assessmentRes.rows[0].answers.skills;
      }
    }

    // Allow query override if provided (e.g. ?skills=JSON)
    if (req.query.skills) {
      try {
        userSkills = { ...userSkills, ...JSON.parse(req.query.skills) };
      } catch (e) {
        // Ignore invalid query json
      }
    }

    const gapReport = analyzeSkillGap(career, userSkills);

    return res.json({
      success: true,
      message: 'Skill gap analysis computed successfully.',
      data: gapReport,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCareerDemandForecast(req, res, next) {
  try {
    const { id } = req.params;
    const careerRes = await query('SELECT title, required_skills FROM careers WHERE id = $1', [id]);

    if (careerRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Career profile not found.',
        data: null,
      });
    }

    const career = careerRes.rows[0];
    const skills = Array.isArray(career.required_skills)
      ? career.required_skills.map((s) => s.skill)
      : [];

    const forecast = forecastDemandForSkills(skills);

    return res.json({
      success: true,
      message: 'Skill demand forecast calculated successfully.',
      data: {
        careerTitle: career.title,
        ...forecast,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  getAllCareers,
  getCareerById,
  getCareerSkillGap,
  getCareerDemandForecast,
};
