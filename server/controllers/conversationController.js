const Conversation = require("../models/Conversation");
const Message = require("../models/Message")
const User = require("../models/User");
const { translateLastMessageForViewer } = require("../services/ai/translateLastMessageForViewer");

const createConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "senderId and receiverId are required" });
    }

    // check if conversation already exists between these two users
    const existingConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    const newConversation = await Conversation.create({
      members: [senderId, receiverId],

      aiSettings: [
        {
          user: senderId,
          enabled: false,
          language: "Original",
        },
        {
          user: receiverId,
          enabled: false,
          language: "Original",
        },
      ],
    });

    res.status(201).json(newConversation);
  } catch (error) {
    console.error("Create conversation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).sort({ updatedAt: -1 });

    const conversationData = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = conversation.members.find(memberId => memberId != userId);
        const otherUser = await User.findById(otherUserId).select("-password");
        return {
          ...conversation._doc,
          otherUser,
        };
      })
    )

    const updated = await Promise.all(
      conversationData.map(async (conv) => ({
        ...conv,
        lastMessage: await translateLastMessageForViewer({
          conversation: conv,
          viewerId: userId,
        }),
      }))
    );

    return res.json(updated);
  } catch (error) {
    console.error("Get conversations error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();

    return res.status(200).json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Mark conversation as read error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAcceptedConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({
      members: userId,
      $or: [
        {
          status: "accepted",
        },
        {
          status: "pending",
          requestedBy: userId,
        },
      ],
    })
      .populate("pinnedMessage").sort({ updatedAt: -1 });

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = conversation.members.find(
          (id) => id.toString() !== userId
        );

        const otherUser = await User.findById(otherUserId).select("-password");

        return {
          ...conversation._doc,
          otherUser,

          lastMessage: await translateLastMessageForViewer({
            conversation,
            viewerId: userId,
          }),
        };
      })
    );

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getConversationRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({
      members: userId,
      status: "pending",
      requestedBy: { $ne: userId },
    }).populate("pinnedMessage").sort({ updatedAt: -1 });

    const data = await Promise.all(
      conversations.map(async (conversation) => {

        const otherUserId = conversation.members.find(
          (id) => id.toString() !== userId
        );

        const otherUser = await User.findById(otherUserId).select("-password");

        return {
          ...conversation._doc,
          otherUser,

          lastMessage: await translateLastMessageForViewer({
            conversation,
            viewerId: userId,
          }),
        };

      })
    );

    res.json(data);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const acceptConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation =
      await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    conversation.status = "accepted";
    conversation.acceptedAt = new Date();

    await conversation.save();

    const otherUserId = conversation.members.find(
      (id) =>
        id.toString() !==
        conversation.requestedBy.toString()
    );

    const otherUser = await User.findById(otherUserId)
      .select("-password");

    res.json({
      ...conversation._doc,
      otherUser,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateAISettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled, language } = req.body;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const userId = req.user._id.toString();

    let settings = conversation.aiSettings.find(
      (s) => s.user.toString() === userId
    );

    if (!settings) {
      settings = {
        user: userId,
        enabled,
        language,
      };

      conversation.aiSettings.push(settings);
    } else {
      settings.enabled = enabled;
      settings.language = language;
    }

    await conversation.save();
    await conversation.populate("pinnedMessage");

    return res.status(200).json(conversation);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const unpinMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    conversation.pinnedMessage = null;

    await conversation.save();

    res.json(conversation);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to unpin message",
    });
  }
};

const rejectConversation = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.deleteMany({
      conversationId: id,
    });

    await Conversation.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Request rejected",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const pinMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { messageId } = req.body;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (
      String(message.conversationId) !==
      String(conversation._id)
    ) {
      return res.status(400).json({
        message: "Message does not belong to this conversation",
      });
    }

    conversation.pinnedMessage = messageId;

    await conversation.save();

    const updatedConversation =
      await Conversation.findById(conversation._id)
        .populate("pinnedMessage");

    res.json(updatedConversation);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to pin message",
    });
  }
};

module.exports = {
  createConversation,
  getUserConversations,
  markConversationAsRead,
  updateAISettings,
  getAcceptedConversations,
  getConversationRequests,
  acceptConversation,
  rejectConversation,
  pinMessage,
  unpinMessage,
};