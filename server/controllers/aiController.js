const { rewriteMessage } = require("../services/ai/rewriteMessage");

const rewrite = async (req, res) => {
    try {
        const {
            text,
            tone = "Grammar",
        } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({
                message: "Message text is required",
            });
        }

        const VALID_TONES = [
            "Grammar",
            "Friendly",
            "Professional",
            "Formal",
            "Funny",
            "Confident",
            "Polite",
        ];

        if (!VALID_TONES.includes(tone)) {
            return res.status(400).json({
                message: "Invalid tone",
            });
        }

        const rewritten = await rewriteMessage({
            text,
            tone,
        });

        return res.status(200).json({
            text: rewritten,
        });

    } catch (err) {
        console.error("Rewrite error:", err);

        return res.status(500).json({
            message: "Server Error",
        });
    }
};

module.exports = {
    rewrite,
};