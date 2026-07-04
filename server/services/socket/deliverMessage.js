const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const { transformMessages } = require("../ai/aiService");
const { getConversationHistory } = require("../ai/conversationMemory");
const { translateForViewer } = require("../ai/translateForViewer");


const deliverMessage = async ({
  io,
  getUser,
  message,
  messageId,
  receiverId,
  socketEvent = "getMessage",
}) => {
  const receiver = getUser(receiverId);
  if (!receiver) return;
  const conversationId =
    message?.conversationId ||
    (await Message.findById(messageId).select("conversationId"))
      ?.conversationId;

  if (!conversationId) return;

  
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) return;

  
  const settings = conversation.aiSettings.find(
    (s) => String(s.user) === String(receiverId)
  );

  const socketMessage = await translateForViewer({
    message: messageId || message,
    settings,
  });


  if (!socketMessage) return;

  io.to(receiver.socketId).emit(socketEvent, socketMessage);
};

module.exports = {
  deliverMessage,
};
