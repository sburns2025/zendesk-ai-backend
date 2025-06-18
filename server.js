const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/openai', async (req, res) => {
  const { action, input } = req.body;
  let prompt;

  if (action === 'help') {
    prompt = `Generate a helpful support agent response to this ticket: ${input}`;
  } else if (action === 'summarize') {
    prompt = `Summarize this Zendesk ticket conversation: ${input}`;
  } else if (action === 'adjust') {
    const friendly = await callOpenAI(`Rewrite more friendly: ${input}`);
    const professional = await callOpenAI(`Rewrite more professionally: ${input}`);
    const concise = await callOpenAI(`Make more concise: ${input}`);
    return res.json({ friendly, professional, concise });
  }

  const output = await callOpenAI(prompt);
  res.json({ output });
});

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
