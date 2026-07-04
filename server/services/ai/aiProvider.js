const config = require("./config");

const gemini = require("./providers/gemini");
const grok = require("./providers/grok");
const groq = require("./providers/groq");
const generate = async (prompt) => {

    switch (config.provider) {
    case "gemini":
      return gemini.generate(prompt);

    case "grok":
      return grok.generate(prompt);

    case "groq":
      return groq.generate(prompt);

    default:
      throw new Error("Unsupported AI provider");
  }

};

module.exports = {
    generate,
};