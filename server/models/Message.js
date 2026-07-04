const { default: mongoose } = require("mongoose");

const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },
    text: {
        type: String,
        trim: true,
    },

    translations: [
        {
            language: {
                type: String,
                required: true,
            },

            text: {
                type: String,
                required: true,
            },

            model: {
                type: String,
                default: "gemini-2.5-flash",
            },

            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    image: {
        type: String,
        default: "",
    },

    attachment: {
        url: String,
        publicId: String,
        name: String,
        mimeType: String,
        size: Number,
        type: {
            type: String,
            enum: ["image", "video", "audio", "document", "pdf"],
            default: undefined,
        }
    },

    deliveredAt: {
        type: Date,
        default: null,
    },
    seenAt: {
        type: Date,
        default: null,
    },
    deleted: {
        type: Boolean,
        default: false,
    },

    deletedAt: {
        type: Date,
        default: null,
    },
    reactions: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            emoji: {
                type: String,
                required: true,
            },
        },
    ],
    edited: {
        type: Boolean,
        default: false,
    },

    editedAt: {
        type: Date,
        default: null,
    },

    forwarded: {
        type: Boolean,
        default: false,
    },

    originalSender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}
    , { timestamps: true }

);

module.exports = mongoose.model("Message", messageSchema);