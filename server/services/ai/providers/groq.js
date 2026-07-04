const Groq = require("groq-sdk");
const config = require("../config");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generate = async (prompt) => {
  const completion = await groq.chat.completions.create({
    model: config.model,
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content.trim();
};

module.exports = {
  generate,
};