import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, input } = req.body;
  if (!input || !action) return res.status(400).json({ error: 'Missing input or action' });

  try {
    if (action === 'adjust') {
      const [friendly, professional, concise] = await Promise.all([
        getGPT(`Make this message more friendly:\n\n${input}`),
        getGPT(`Make this message more professional:\n\n${input}`),
        getGPT(`Make this message more concise:\n\n${input}`)
      ]);
      return res.status(200).json({ friendly, professional, concise });
    }

    if (action === 'summarize') {
      const output = await getGPT(`Summarize this ticket in one sentence:\n\n${input}`);
      return res.status(200).json({ output });
    }

    if (action === 'help') {
      const output = await getGPT(`Suggest a helpful response to this customer message:\n\n${input}`);
      return res.status(200).json({ output });
    }

    return res.status(400).json({ error: 'Invalid action type' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'OpenAI API error' });
  }
}

async function getGPT(prompt) {
  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  });
  return chat.choices[0].message.content.trim();
}
