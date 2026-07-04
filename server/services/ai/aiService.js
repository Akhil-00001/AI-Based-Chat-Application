const aiProvider = require("./aiProvider");
const { buildBatchPrompt } = require("./promptBuilder");


const transformMessages = async ({
  messages,
  history,
  language,
}) => {

  const prompt = buildBatchPrompt({
    messages,
    history,
    language,
  });

  return await aiProvider.generate(prompt);
};

module.exports = {
    // transformMessage,
    transformMessages,
};
