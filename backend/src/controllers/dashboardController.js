import { query } from '../config/db.js';
import { analyzeSkillGap } from '../services/skillGapService.js';

export async function getDashboardData(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Fetch user profile
    const userRes = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // 2. Fetch latest assessment
    const assessRes = await query(
      'SELECT id, answers, results, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    const latestAssessment = assessRes.rows[0] || null;
    let topCareer = null;
    let skillGapData = null;

    if (latestAssessment?.results?.topCareers?.length > 0) {
      topCareer = latestAssessment.results.topCareers[0];

      // Fetch career from db for full required skills
      const careerDbRes = await query('SELECT * FROM careers WHERE id = $1', [topCareer.careerId || topCareer.id]);
      if (careerDbRes.rowCount > 0) {
        const fullCareer = careerDbRes.rows[0];
        skillGapData = analyzeSkillGap(fullCareer, latestAssessment.answers?.skills || {});
      }
    }

    // 3. Fetch latest roadmap and progress
    const roadmapRes = await query(
      `SELECT r.id, r.career_id, r.plan, r.created_at, c.title as career_title
       FROM roadmaps r
       JOIN careers c ON r.career_id = c.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC LIMIT 1`,
      [userId]
    );

    let activeRoadmap = null;
    if (roadmapRes.rowCount > 0) {
      const rm = roadmapRes.rows[0];
      const progRes = await query(
        'SELECT task_id, completed FROM roadmap_progress WHERE roadmap_id = $1',
        [rm.id]
      );

      const completedMap = {};
      progRes.rows.forEach((p) => {
        completedMap[p.task_id] = p.completed;
      });

      let totalTasks = 0;
      let completedTasks = 0;
      rm.plan?.weeks?.forEach((w) => {
        w.tasks?.forEach((t) => {
          totalTasks++;
          if (completedMap[t.id]) completedTasks++;
        });
      });

      activeRoadmap = {
        id: rm.id,
        careerId: rm.career_id,
        careerTitle: rm.career_title,
        title: rm.plan?.title || 'Learning Roadmap',
        totalTasks,
        completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        createdAt: rm.created_at,
      };
    }

    // 4. Fetch latest resume analysis
    const resumeRes = await query(
      'SELECT id, file_name, match_score, result, created_at FROM resume_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const latestResume = resumeRes.rows[0] || null;

    // 5. Activity counts
    const countAssessments = await query('SELECT COUNT(*) FROM assessments WHERE user_id = $1', [userId]);
    const countRoadmaps = await query('SELECT COUNT(*) FROM roadmaps WHERE user_id = $1', [userId]);
    const countResumes = await query('SELECT COUNT(*) FROM resume_analyses WHERE user_id = $1', [userId]);

    return res.json({
      success: true,
      message: 'Dashboard data retrieved successfully.',
      data: {
        user,
        latestAssessment: latestAssessment ? {
          id: latestAssessment.id,
          createdAt: latestAssessment.created_at,
          topCareer,
        } : null,
        skillGap: skillGapData,
        activeRoadmap,
        latestResume: latestResume ? {
          id: latestResume.id,
          fileName: latestResume.file_name,
          matchScore: latestResume.match_score,
          careerTitle: latestResume.result?.careerTitle,
          summary: latestResume.result?.feedback?.overallSummary,
          createdAt: latestResume.created_at,
        } : null,
        stats: {
          assessmentsCount: Number(countAssessments.rows[0].count),
          roadmapsCount: Number(countRoadmaps.rows[0].count),
          resumesCount: Number(countResumes.rows[0].count),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  getDashboardData,
};
