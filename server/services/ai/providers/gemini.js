const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: config.model,
});

const generate = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini Error:", err);

    if (err.status === 429) {
      throw new Error("QUOTA_EXCEEDED");
    }

    throw err;
  }
};

module.exports = {
    generate,
};