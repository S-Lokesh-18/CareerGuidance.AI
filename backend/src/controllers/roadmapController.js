import { z } from 'zod';
import { query } from '../config/db.js';
import { generateJSON } from '../services/aiService.js';

const RoadmapPlanSchema = z.object({
  title: z.string(),
  careerTitle: z.string(),
  durationWeeks: z.number(),
  overview: z.string(),
  weeks: z.array(
    z.object({
      weekNumber: z.number(),
      title: z.string(),
      description: z.string(),
      tasks: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional().default(''),
        })
      ),
      resources: z.array(
        z.object({
          name: z.string(),
          url: z.string(),
          type: z.string().optional().default('Documentation'),
        })
      ).optional().default([]),
    })
  ),
  miniProject: z.object({
    title: z.string(),
    description: z.string(),
    deliverables: z.array(z.string()).optional().default([]),
  }),
});

function getCuratedFallbackRoadmap(career) {
  const title = career.title;
  return {
    title: `Comprehensive 6-Week Mastery Roadmap for ${title}`,
    careerTitle: title,
    durationWeeks: 6,
    overview: `A progressive, practical learning path designed to bridge foundational competencies and build production-ready projects in ${title}.`,
    weeks: [
      {
        weekNumber: 1,
        title: 'Foundations & Architecture',
        description: 'Understand key paradigms, core syntax, and development environments.',
        tasks: [
          { id: 'w1_t1', title: 'Set up development tooling and version control workflow', description: 'Configure IDE, Git, and terminal workspace.' },
          { id: 'w1_t2', title: 'Review fundamentals and core principles', description: 'Read official documentation and architectural standards.' },
          { id: 'w1_t3', title: 'Complete 3 introductory hands-on practice exercises', description: 'Implement simple scripts and baseline examples.' }
        ],
        resources: [
          { name: 'Official MDN & Developer Guides', url: 'https://developer.mozilla.org', type: 'Documentation' },
          { name: 'freeCodeCamp Interactive Curriculum', url: 'https://www.freecodecamp.org', type: 'Course' }
        ]
      },
      {
        weekNumber: 2,
        title: 'Core Tooling & Data Structures',
        description: 'Deep dive into data handling, component structures, and problem-solving.',
        tasks: [
          { id: 'w2_t1', title: 'Build modular functions and data pipelines', description: 'Clean and transform representative datasets.' },
          { id: 'w2_t2', title: 'Implement error handling and edge condition tests', description: 'Ensure defensive coding and robust validation.' }
        ],
        resources: [
          { name: 'Khan Academy / Coursera Essentials', url: 'https://www.coursera.org', type: 'Video' }
        ]
      },
      {
        weekNumber: 3,
        title: 'Applied Engineering & Integrations',
        description: 'Integrate external APIs, database queries, and structured schemas.',
        tasks: [
          { id: 'w3_t1', title: 'Connect to external endpoints and consume structured JSON', description: 'Handle asynchronous states and caching.' },
          { id: 'w3_t2', title: 'Design database schema or state management structure', description: 'Model relationships and query constraints.' }
        ],
        resources: [
          { name: 'Roadmap.sh Developer Guides', url: 'https://roadmap.sh', type: 'Interactive Guide' }
        ]
      },
      {
        weekNumber: 4,
        title: 'Advanced Features & Optimization',
        description: 'Profile execution speed, security, and refactor code modules.',
        tasks: [
          { id: 'w4_t1', title: 'Perform security audits and input sanitization', description: 'Mitigate standard vulnerabilities.' },
          { id: 'w4_t2', title: 'Refactor components for maintainability and speed', description: 'Apply clean code practices.' }
        ],
        resources: [
          { name: 'OWASP Security Cheat Sheets', url: 'https://cheatsheetseries.owasp.org', type: 'Security Guide' }
        ]
      },
      {
        weekNumber: 5,
        title: 'Testing & Continuous Integration',
        description: 'Write automated unit tests and configure automated builds.',
        tasks: [
          { id: 'w5_t1', title: 'Implement unit and integration tests', description: 'Achieve >70% test coverage on core routines.' },
          { id: 'w5_t2', title: 'Create automated GitHub Actions or CI script', description: 'Verify build passing on push.' }
        ],
        resources: [
          { name: 'GitHub Actions Documentation', url: 'https://docs.github.com/actions', type: 'Documentation' }
        ]
      },
      {
        weekNumber: 6,
        title: 'Capstone Mini-Project & Portfolio Delivery',
        description: 'Synthesize all knowledge into a public, deployed portfolio project.',
        tasks: [
          { id: 'w6_t1', title: 'Assemble portfolio-grade capstone project', description: 'Complete full functionality and polish user interface.' },
          { id: 'w6_t2', title: 'Deploy live application and author detailed README', description: 'Include architectural diagram and live demo link.' }
        ],
        resources: [
          { name: 'Vercel / Render Deployment Guides', url: 'https://vercel.com/docs', type: 'Deployment' }
        ]
      }
    ],
    miniProject: {
      title: `${title} Portfolio Capstone Application`,
      description: `A complete, end-to-end practical project showcasing core competencies in ${title}. Includes authentication, interactive data views, and public deployment.`,
      deliverables: [
        'Public GitHub repository with comprehensive documentation',
        'Working demo deployed on cloud hosting',
        'Short walkthrough video or writeup explaining architectural decisions'
      ]
    }
  };
}

export async function generateRoadmap(req, res, next) {
  try {
    const userId = req.user.id;
    const { careerId, regenerate } = req.body;

    // Validate career exists
    const careerRes = await query('SELECT * FROM careers WHERE id = $1', [careerId]);
    if (careerRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Career not found',
        data: null,
      });
    }
    const career = careerRes.rows[0];

    // Check if user already has a roadmap for this career and regenerate is not requested
    if (!regenerate) {
      const existingRes = await query(
        'SELECT * FROM roadmaps WHERE user_id = $1 AND career_id = $2 ORDER BY created_at DESC LIMIT 1',
        [userId, careerId]
      );
      if (existingRes.rowCount > 0) {
        const existingRoadmap = existingRes.rows[0];
        // Fetch progress
        const progRes = await query(
          'SELECT task_id, completed FROM roadmap_progress WHERE roadmap_id = $1',
          [existingRoadmap.id]
        );
        return res.json({
          success: true,
          message: 'Existing roadmap retrieved.',
          data: {
            roadmap: existingRoadmap,
            progress: progRes.rows,
          },
        });
      }
    }

    // Retrieve user's assessment if available for context
    const assessmentRes = await query(
      'SELECT answers FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const userAnswers = assessmentRes.rows[0]?.answers || {};

    const fallbackPlan = getCuratedFallbackRoadmap(career);

    const prompt = `You are a world-class tech mentor. Generate a structured 6-week curriculum for a student aspiring to become a "${career.title}".
Required skills for this role: ${JSON.stringify(career.required_skills)}
User's current skill self-evaluations: ${JSON.stringify(userAnswers.skills || {})}
Education: ${userAnswers.education || 'General'}

Return ONLY valid JSON matching this schema:
{
  "title": "Roadmap title",
  "careerTitle": "${career.title}",
  "durationWeeks": 6,
  "overview": "Clear 2-sentence summary of the roadmap",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1 Theme",
      "description": "Weekly focus description",
      "tasks": [
        { "id": "w1_t1", "title": "Task title", "description": "Specific action" },
        { "id": "w1_t2", "title": "Task title", "description": "Specific action" }
      ],
      "resources": [
        { "name": "Resource Name", "url": "https://example.com", "type": "Documentation" }
      ]
    }
    ... total 6 weeks
  ],
  "miniProject": {
    "title": "Project Name",
    "description": "Capstone project description",
    "deliverables": ["Deliverable 1", "Deliverable 2"]
  }
}`;

    let plan = fallbackPlan;
    try {
      const aiResult = await generateJSON(prompt, RoadmapPlanSchema, fallbackPlan);
      if (aiResult?.weeks?.length) {
        plan = aiResult;
      }
    } catch (err) {
      console.warn('AI roadmap generation failed, using curated plan:', err.message);
    }

    const insertRes = await query(
      'INSERT INTO roadmaps (user_id, career_id, plan) VALUES ($1, $2, $3) RETURNING *',
      [userId, careerId, JSON.stringify(plan)]
    );
    const roadmap = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Learning roadmap created successfully.',
      data: {
        roadmap,
        progress: [],
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRoadmapById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const roadmapRes = await query(
      'SELECT r.*, c.title as career_title FROM roadmaps r JOIN careers c ON r.career_id = c.id WHERE r.id = $1 AND r.user_id = $2',
      [id, userId]
    );

    if (roadmapRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or unauthorized',
        data: null,
      });
    }

    const roadmap = roadmapRes.rows[0];

    const progRes = await query(
      'SELECT task_id, completed FROM roadmap_progress WHERE roadmap_id = $1',
      [roadmap.id]
    );

    const progressMap = {};
    progRes.rows.forEach((r) => {
      progressMap[r.task_id] = r.completed;
    });

    // Calculate completion stats
    const plan = roadmap.plan;
    let totalTasks = 0;
    let completedTasks = 0;

    if (plan?.weeks) {
      plan.weeks.forEach((w) => {
        if (w.tasks) {
          w.tasks.forEach((t) => {
            totalTasks++;
            if (progressMap[t.id]) {
              completedTasks++;
            }
          });
        }
      });
    }

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.json({
      success: true,
      message: 'Roadmap retrieved.',
      data: {
        roadmap,
        progress: progRes.rows,
        stats: {
          totalTasks,
          completedTasks,
          completionPercentage,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserRoadmaps(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT r.id, r.career_id, r.plan->>'title' as roadmap_title, c.title as career_title, r.created_at,
              COUNT(rp.id) FILTER (WHERE rp.completed = true) as completed_tasks
       FROM roadmaps r
       JOIN careers c ON r.career_id = c.id
       LEFT JOIN roadmap_progress rp ON r.id = rp.roadmap_id
       WHERE r.user_id = $1
       GROUP BY r.id, c.title
       ORDER BY r.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      message: 'Roadmaps retrieved.',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { id, taskId } = req.params;
    const { completed } = req.body;

    // Verify ownership
    const checkRes = await query('SELECT id FROM roadmaps WHERE id = $1 AND user_id = $2', [id, userId]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or unauthorized',
        data: null,
      });
    }

    const upsertRes = await query(
      `INSERT INTO roadmap_progress (roadmap_id, task_id, completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (roadmap_id, task_id)
       DO UPDATE SET completed = EXCLUDED.completed
       RETURNING *`,
      [id, taskId, Boolean(completed)]
    );

    return res.json({
      success: true,
      message: 'Task progress updated.',
      data: upsertRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

export default {
  generateRoadmap,
  getRoadmapById,
  getUserRoadmaps,
  updateTaskProgress,
};
