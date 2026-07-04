const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      text: {
        type: String,
        default: "",
      },
      sender: {
        type: String,
        default: "",
      },
      createdAt: {
        type: Date,
        default: null,
      },
      deleted: {
        type: Boolean,
        default: false,
      },
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    aiSettings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        language: {
          type: String,
          default: "Original",
        },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "accepted", "blocked", "rejected"],
      default: "pending",
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
    pinnedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);