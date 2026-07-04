const Message = require("../../models/Message");
const config = require("./config");

const getConversationHistory = async (conversationId, senderId) => {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(config.maxContextMessages)
    .select("sender text originalText")
    .lean();

  return messages
    .reverse()
    .map((msg) => {
      const role =
        msg.sender.toString() === senderId.toString()
          ? "You"
          : "Friend";

      return `${role}: ${msg.text}`;
    })
    .join("\n");
};

module.exports = {
  getConversationHistory,
};