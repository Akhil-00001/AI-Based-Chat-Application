const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { translateForViewer } = require("../services/ai/translateForViewer");

const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      senderId,
      receiverId,
      text,
      replyTo
    }
      =
      req.body;
    if ((!conversationId && (!senderId || !receiverId)) || (!text && !req.file)) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    let imageUrl = "";

    let attachment = {
      url: "",
      type: "",
      name: "",
      mimeType: "",
      size: 0,
    };

    if (req.file) {

      imageUrl = await new Promise((resolve, reject) => {

        let folder = "chat-app/documents";

        if (req.file.mimetype.startsWith("image/")) {
          folder = "chat-app/images";
        }
        else if (req.file.mimetype.startsWith("video/")) {
          folder = "chat-app/videos";
        }
        else if (req.file.mimetype.startsWith("audio/")) {
          folder = "chat-app/audio";
        }

        let resourceType;
        let attachmentType;

        const mime = req.file.mimetype;
        const originalName = req.file.originalname || "file";

        if (mime.startsWith("image/")) {
          resourceType = "image";
          attachmentType = "image";
        }
        else if (mime === "application/pdf") {
          resourceType = "raw";
          attachmentType = "document";
        }
        else if (mime.startsWith("video/")) {
          resourceType = "video";
          attachmentType = "video";
        }
        else if (mime.startsWith("audio/")) {
          resourceType = "video";
          attachmentType = "audio";
        }
        else {
          resourceType = "raw";
          attachmentType = "document";
        }
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: false,
            filename_override: originalName,
          },
          (error, result) => {
            if (error) return reject(error);

            attachment = {
              url: result.secure_url,
              publicId: result.public_id,
              name: originalName,
              mimeType: mime,
              size: req.file.size,
              type: attachmentType,
            };

            resolve(result.secure_url);
          }
        );



        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          members: [senderId, receiverId],

          status: "pending",

          requestedBy: senderId,

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
      }
    }

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }



    const messageData = {
      conversationId: conversation._id,
      sender: senderId,
      text: text || "",
      image: attachment.type === "image" ? attachment.url : "",
      replyTo,
    };

    if (attachment.url) {
      messageData.attachment = attachment;
    }

    const newMessage = await Message.create(messageData);




    const otherUserId = conversation.members.find(
      (memberId) => memberId.toString() !== senderId.toString()
    );

    const currentUnread =
      conversation.unreadCounts?.get(otherUserId.toString()) || 0;

    conversation.lastMessage = {
      text:
        text ||
        (attachment.type ? `📎 ${attachment.name}` : "📷 Photo"),
      sender: senderId,
      createdAt: newMessage.createdAt,
      deleted: false,
    };


    conversation.unreadCounts.set(otherUserId.toString(), currentUnread + 1);
    conversation.unreadCounts.set(senderId.toString(), 0);

    await conversation.save();
    await newMessage.populate("replyTo");
    // await newMessage.save();
    return res.status(201).json({
      message: newMessage,
      conversation,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("replyTo")
      .sort({ createdAt: 1 });

    const viewerId = req.user._id;
    const conversation = await Conversation.findById(conversationId);
    const settings = conversation.aiSettings.find(
      s => String(s.user) === String(req.user._id)
    );

    const translatedMessages = await Promise.all(
      messages.map((msg) =>
        translateForViewer({
          message: msg,
          settings,
        })
      )
    );

    return res.json(translatedMessages);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

    const conversation = await Conversation.findById(
      message.conversationId
    );

    const isLastMessage =
      conversation.lastMessage?.createdAt &&
      new Date(conversation.lastMessage.createdAt).getTime() ===
      new Date(message.createdAt).getTime();

    if (isLastMessage) {
      conversation.lastMessage = {
        text: "",
        sender: message.sender,
        createdAt: message.createdAt,
        deleted: true,
      };

      await conversation.save();
    }

    return res.status(200).json({
      message,
      conversation,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, emoji } = req.body;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.sender.toString() === userId) {
      return res.status(403).json({
        message: "You cannot react to your own message",
      });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingReactionIndex !== -1) {


      if (message.reactions[existingReactionIndex].emoji === emoji) {

        message.reactions.splice(existingReactionIndex, 1);
      } else {

        message.reactions[existingReactionIndex].emoji = emoji;
      }

    } else {

      message.reactions.push({
        user: userId,
        emoji,
      });
    }

    await message.save();

    return res.status(200).json(message);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const conversation = await Conversation.findById(
      message.conversationId
    );



    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can edit
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Don't edit deleted messages
    if (message.deleted) {
      return res.status(400).json({
        message: "Cannot edit deleted message",
      });
    }

    message.text = text;
    message.translations = [];
    message.edited = true;
    message.editedAt = new Date();

    const isLastMessage =
      conversation.lastMessage?.createdAt &&
      new Date(conversation.lastMessage.createdAt).getTime() ===
      new Date(message.createdAt).getTime();

    if (isLastMessage) {
      conversation.lastMessage.text = message.text;
      await conversation.save();
    }


    await message.save();

    return res.status(200).json({ message, conversation });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};


const forwardMessage = async (req, res) => {
  try {

    const {
      messageId,
      conversationId,
    } = req.body;

    if (!messageId || !conversationId) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    const original = await Message.findById(messageId);

    if (!original) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const conversation =
      await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const messageData = {

      conversationId,

      sender: req.user._id,

      text: original.text,

      image: original.image,

      attachment: original.attachment,

      forwarded: true,

      originalSender:
        original.originalSender || original.sender,

    };

    const newMessage =
      await Message.create(messageData);

    const otherUserId =
      conversation.members.find(
        (memberId) =>
          memberId.toString() !==
          req.user._id.toString()
      );

    const currentUnread =
      conversation.unreadCounts?.get(
        otherUserId.toString()
      ) || 0;

    conversation.lastMessage = {

      text:
        original.text ||
        (original.attachment?.type
          ? `📎 ${original.attachment.name}`
          : "📷 Photo"),

      sender: req.user._id,

      createdAt: newMessage.createdAt,

      deleted: false,

    };

    conversation.unreadCounts.set(
      otherUserId.toString(),
      currentUnread + 1
    );

    conversation.unreadCounts.set(
      req.user._id.toString(),
      0
    );

    await conversation.save();

    await newMessage.populate("replyTo");

    return res.status(201).json({

      message: newMessage,

      conversation,

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });

  }
};


module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
  reactToMessage,
  editMessage,
  forwardMessage,
};
