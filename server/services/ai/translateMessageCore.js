const { transformMessages } = require("./aiService");
const { getConversationHistory } = require("./conversationMemory");

const translateMessageCore = async ({
    dbMessage,
    currentMessage,
    settings,
}) => {
    if (!currentMessage.text?.trim()) {
        return currentMessage;
    }
    const cachedTranslation = dbMessage.translations.find(
        (t) => t.language === settings.language
    );

    if (cachedTranslation) {
        return {
            ...currentMessage,
            // originalText: currentMessage.text,
            text: cachedTranslation.text,
            // translated: true,
        };
    }
    const history = await getConversationHistory(
        currentMessage.conversationId,
        settings.user
    );
    const response = await transformMessages({
        messages: [dbMessage],
        history,
        language: settings.language,
    });
    let translated = [];

    try {
        translated = JSON.parse(
            response
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim()
        );
    } catch (err) {
        console.error("AI JSON Error", err);
        return currentMessage;
    }
    const translatedMessage = translated.find(
        (m) => String(m._id) === String(currentMessage._id)
    );

    if (!translatedMessage) {
        return currentMessage;
    }

    dbMessage.translations.push({
        language: settings.language,
        text: translatedMessage.text,
        model: "llama-3.3-70b-versatile",
    });

    await dbMessage.save();
    return {
        ...currentMessage,
        text: translatedMessage.text,
        translated: true,
    };
};

module.exports = {
    translateMessageCore,
};