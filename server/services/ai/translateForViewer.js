const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const { transformMessages } = require("./aiService");
const { getConversationHistory } = require("./conversationMemory");
const { translateMessageCore } = require("./translateMessageCore");

const translateForViewer = async ({
    message,
    settings,
}) => {
    let dbMessage;

    if (typeof message === "string") {
        dbMessage = await Message.findById(message).populate("replyTo");
    } else if (message.toObject) {
        // Already a mongoose document
        dbMessage = message;
    } else {
        dbMessage = await Message.findById(message._id).populate("replyTo");
    }

    if (!dbMessage) {
        return null;
    }

    const currentMessage = dbMessage.toObject();


    if (
        !settings ||
        !settings.enabled ||
        settings.language === "Original"
    ) {
        return currentMessage;
    }
    if (String(currentMessage.sender) === String(settings.user)) {
        return currentMessage;
    }

    return await translateMessageCore({
        dbMessage,
        currentMessage,
        settings,
    });
};

module.exports = {
    translateForViewer,
};