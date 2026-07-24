import TaskModel from '../models/TaskModel.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function buildFallbackInsight(tasks) {
  const total = tasks.length;
  if (total === 0) {
    return 'No tasks yet — create one to get personalized AI insights here.';
  }
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const highPriorityPending = tasks.filter(t => t.status !== 'Completed' && t.priority === 'High');
  const parts = [`You have ${total} task${total === 1 ? '' : 's'} total, ${pending} still pending.`];
  if (highPriorityPending.length > 0) {
    parts.push(`Focus on "${highPriorityPending[0].title}" first — it's marked High priority and not done yet.`);
  }
  return parts.join(' ');
}

// GET /api/ai/insights?projectId=optional
export const getTaskInsights = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tasks = await TaskModel.getAll({ projectId });
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        data: {
          insight: buildFallbackInsight(tasks),
          aiEnabled: false,
        },
      });
    }

    const taskSummary = tasks.slice(0, 40).map(t => `- [${t.status} / ${t.priority} priority] ${t.title}`).join('\n') || 'No tasks yet.';
    const prompt = `You are a concise productivity assistant embedded in a task dashboard. Based on the task list below, write 2-3 short sentences telling the user exactly what to prioritize next and flag any obvious risk (e.g. many High priority items still Pending). Be specific, direct, and do not use any preamble like "Sure" or "Here is".\n\nTasks:\n${taskSummary}`;

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 160,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      // Fall back gracefully instead of surfacing a raw API failure to the user.
      console.error('Groq API error:', response.status, await response.text().catch(() => ''));
      return res.status(200).json({
        success: true,
        data: { insight: buildFallbackInsight(tasks), aiEnabled: false },
      });
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content?.trim() || buildFallbackInsight(tasks);

    res.status(200).json({ success: true, data: { insight, aiEnabled: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate AI insight.', error: err.message });
  }
};
