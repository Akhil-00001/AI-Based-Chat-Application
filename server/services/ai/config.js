module.exports = {
  provider: process.env.AI_PROVIDER || "gemini",

  model: process.env.AI_MODEL || "gemini-2.5-flash",

  maxContextMessages: Number(process.env.AI_CONTEXT_LIMIT || 10),
};