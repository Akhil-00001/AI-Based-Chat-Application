const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const config = require("../config");

const generate = async (prompt) => {
  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content.trim();
};

module.exports = {
  generate,
};