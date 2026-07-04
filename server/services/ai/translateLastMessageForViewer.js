const Message = require("../../models/Message");
const { transformMessages } = require("./aiService");
const { getConversationHistory } = require("./conversationMemory");
const { translateMessageCore } = require("./translateMessageCore");

const translateLastMessageForViewer = async ({
    conversation,
    viewerId,
}) => {
    const settings = conversation.aiSettings.find(
        s => String(s.user) === String(viewerId)
    );

    if (!conversation.lastMessage) {
        return null;
    }

    if (
        !settings ||
        !settings.enabled ||
        settings.language === "Original"
    ) {
        return conversation.lastMessage;
    }
    if (
        String(conversation.lastMessage.sender) ===
        String(viewerId)
    ) {
        return conversation.lastMessage;
    }
    const dbMessage = await Message.findOne({
        conversationId: conversation._id,
        createdAt: conversation.lastMessage.createdAt,
    }).populate("replyTo");

    if (!dbMessage) {
        return conversation.lastMessage;
    }
    if (!dbMessage.text?.trim()) {
        return conversation.lastMessage;
    }

    const translated = await translateMessageCore({
        dbMessage,
        currentMessage: dbMessage.toObject(),
        settings,
    });
    return {
        ...conversation.lastMessage,
        text: translated.text,
    };
};

module.exports = {
    translateLastMessageForViewer,
};