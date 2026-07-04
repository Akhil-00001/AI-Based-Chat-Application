
const buildBatchPrompt = ({
  messages,
  history = "",
  language,
}) => {
  return `
  You are a professional multilingual chat translator.

Conversation History:
${history || "No previous conversation."}

Target Language:
${language}

Task:
Translate each message into the target language.

Rules:
- Preserve the sender's original personality.
- Preserve tone exactly as written.
- Preserve emotion.
- Preserve humor.
- Preserve sarcasm.
- Preserve slang and informal expressions.
- Preserve punctuation.
- Preserve capitalization.
- Preserve emojis.
- Preserve line breaks.
- Do NOT summarize.
- Do NOT rewrite.
- Do NOT make the message more formal or less formal.
- Only change the language.
- Return ONLY valid JSON.

Example:

[
  {
    "_id": "123",
    "text": "translated message"
  },
  {
    "_id": "456",
    "text": "translated message"
  }
]

Messages:

${messages
      .map(
        (m) => `
_id:${m._id}

${m.text}
`
      )
      .join("\n----------------------\n")}
  `
};


module.exports = {
  // buildPrompt,
  buildBatchPrompt,
}; 