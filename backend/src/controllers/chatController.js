import { query } from '../config/db.js';
import { generateText } from '../services/aiService.js';
import { analyzeSkillGap } from '../services/skillGapService.js';

export async function sendMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.',
        data: null,
      });
    }

    // 1. Save user's message
    const userMsgRes = await query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, 'user', message.trim()]
    );
    const userMessage = userMsgRes.rows[0];

    // 2. Fetch user's latest assessment & context
    const assessmentRes = await query(
      'SELECT answers, results FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    let topCareerTitle = 'Software Engineering / Data Analytics';
    let matchScore = 80;
    let missingSkills = ['Modern Frameworks', 'System Architecture'];
    let weakSkills = ['Deployment & Cloud'];
    let education = 'Undergraduate / Professional';

    if (assessmentRes.rowCount > 0) {
      const assessment = assessmentRes.rows[0];
      const answers = assessment.answers || {};
      const results = assessment.results || {};
      education = answers.education || education;

      if (results.topCareers && results.topCareers.length > 0) {
        const top = results.topCareers[0];
        topCareerTitle = top.title;
        matchScore = top.finalScore || top.weightedScore || 85;

        // Compute gap for top career
        const careerRes = await query('SELECT * FROM careers WHERE id = $1', [top.careerId || top.id]);
        if (careerRes.rowCount > 0) {
          const gap = analyzeSkillGap(careerRes.rows[0], answers.skills || {});
          missingSkills = gap.missingSkills.map((s) => s.skill).slice(0, 4);
          weakSkills = gap.weakSkills.map((s) => s.skill).slice(0, 4);
        }
      }
    }

    // 3. Fetch last 10 messages for conversational continuity
    const historyRes = await query(
      'SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    const recentMessages = historyRes.rows.reverse();

    const systemInstruction = `You are an empathetic, insightful, and practical AI Career Counselor at the AI Career Guidance Portal.
Student Context:
- Aspiring/Top Match Role: ${topCareerTitle} (${matchScore}% match)
- Education Background: ${education}
- Critical Skill Gaps to Bridge: ${missingSkills.join(', ') || 'None identified'}
- Skills Needing Polish: ${weakSkills.join(', ') || 'None identified'}

Instructions:
1. Provide personalized, constructive, and actionable career guidance.
2. If asked about what to study, reference their skill gaps (${missingSkills.join(', ')}) and recommend specific hands-on project ideas.
3. Keep answers concise (2-4 paragraphs max), warm, and structured with bullet points where helpful.`;

    const formattedHistory = recentMessages
      .map((m) => `${m.role === 'user' ? 'Student' : 'Career Counselor'}: ${m.content}`)
      .join('\n');

    const prompt = `Conversation history:\n${formattedHistory}\n\nPlease respond to the student's latest query thoughtfully:`;

    const fallbackResponse = `Thank you for sharing that! Based on your career profile for ${topCareerTitle} (current match: ${matchScore}%), focusing on closing gaps in ${missingSkills.slice(0, 2).join(' and ') || 'core principles'} will deliver the highest career return. 

Here is what I recommend for your immediate next steps:
• Dedicate 45 minutes daily to building a small end-to-end mini project applying these skills.
• Contribute to open-source or document your progress on GitHub.
• Leverage interactive tutorials and verify your progress with our learning roadmaps.

How would you like to proceed or is there a specific concept you'd like guidance on?`;

    let replyText = fallbackResponse;
    try {
      const generated = await generateText(prompt, systemInstruction, fallbackResponse);
      if (generated && generated.trim().length > 0) {
        replyText = generated.trim();
      }
    } catch (err) {
      console.warn('AI Chatbot using fallback:', err.message);
    }

    // 4. Save assistant response
    const assistantMsgRes = await query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, 'assistant', replyText]
    );
    const assistantMessage = assistantMsgRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Reply generated.',
      data: {
        userMessage,
        assistantMessage,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getChatHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, role, content, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );

    return res.json({
      success: true,
      message: 'Chat history retrieved.',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function clearChatHistory(req, res, next) {
  try {
    const userId = req.user.id;
    await query('DELETE FROM chat_messages WHERE user_id = $1', [userId]);

    return res.json({
      success: true,
      message: 'Chat history cleared.',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  sendMessage,
  getChatHistory,
  clearChatHistory,
};
