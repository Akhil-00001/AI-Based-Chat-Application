const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes")
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const googleAuthRoutes = require("./routes/googleauthRoutes");
const aiRoutes = require("./routes/aiRoutes");
// const aiRoutes = require("./routes/aiRoutes");


connectDB();
const cloudinary = require("./config/cloudinary");
const { deliverMessage } = require("./services/socket/deliverMessage");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/ai", aiRoutes);
// app.use("/api/ai", aiRoutes);
const PORT = process.env.PORT || 5000;

//socket Server

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  onlineUsers = onlineUsers.filter(
    (user) => String(user.userId) !== String(userId)
  );

  onlineUsers.push({
    userId: String(userId),
    socketId,
  });
};



const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find(
    (user) => String(user.userId) === String(userId)
  );
};

io.on("connection", (socket) => {

  socket.on("addUser", async (userId) => {

    addUser(userId, socket.id);
    try {
      const conversations = await Conversation.find({
        members: userId,
      });

      const conversationIds = conversations.map((c) => c._id);

      const undeliveredMessages = await Message.find({
        conversationId: { $in: conversationIds },
        sender: { $ne: userId },
        deliveredAt: null,
      });

      for (const msg of undeliveredMessages) {
        const deliveredAt = new Date();

        await Message.findByIdAndUpdate(msg._id, {
          deliveredAt,
        });

        const sender = getUser(msg.sender.toString());

        if (sender) {
          io.to(sender.socketId).emit("messageDelivered", {
            messageId: msg._id,
            deliveredAt,
          });
        }
      }
    } catch (err) {
      console.error("Delivery sync error:", err);
    }


    io.emit("getOnlineUsers", onlineUsers);
  });

  // socket.on("sendMessage", ({ messageId, senderId, receiverId, text, image, conversationId, createdAt }) => {
  //   const receiver = getUser(receiverId);

  //   if (receiver) {
  //     io.to(receiver.socketId).emit("getMessage", {
  //       messageId,
  //       senderId,
  //       text,
  //       image,
  //       conversationId,
  //       createdAt,
  //     });
  //   }
  // });

  socket.on("sendMessage", async ({ message, receiverId }) => {

    await deliverMessage({
    io,
    getUser,
    message,
    receiverId,
    socketEvent: "getMessage",
});

  });

  socket.on("typing", ({ senderId, receiverId, conversationId }) => {
    const receiver = getUser(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit("typing", {
        senderId,
        conversationId,
      });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId, conversationId }) => {
    const receiver = getUser(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit("stopTyping", {
        senderId,
        conversationId,
      });
    }
  });


  socket.on("messageDelivered", async ({ messageId, senderId }) => {
    try {
      const deliveredAt = new Date();

      await Message.findByIdAndUpdate(messageId, {
        deliveredAt,
      });

      const sender = getUser(senderId);


      if (sender) {
        io.to(sender.socketId).emit("messageDelivered", {
          messageId,
          deliveredAt,
        });
      }
    } catch (err) {
      console.error("Message delivery error:", err);
    }
  });

  socket.on("messageSeen", async ({ messageId, senderId }) => {
    try {
      const seenAt = new Date();

      await Message.findByIdAndUpdate(messageId, {
        seenAt,
      });

      const sender = getUser(senderId);

      if (sender) {
        io.to(sender.socketId).emit("messageSeen", {
          messageId,
          seenAt,
        });
      }
    } catch (err) {
      console.error("Message seen error:", err);
    }
  });

  socket.on(
    "deleteMessage",
    ({ messageId, conversation, receiverId }) => {

      const receiver = getUser(receiverId);

      if (receiver) {
        io.to(receiver.socketId).emit(
          "messageDeleted",
          {
            messageId,
            conversation,
          }
        );
      }

    }
  );

  socket.on("requestSent", ({ conversation, receiverId }) => {
    const receiver = getUser(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit("newRequest", conversation);
    }
  });

  socket.on(
    "editMessage",
    async ({ message, receiverId }) => {

      await deliverMessage({
        io,
        getUser,
        receiverId,
        messageId: message._id,
        socketEvent: "messageEdited",
      });

    }
  );

  socket.on("addReaction", ({ message, receiverId }) => {

    const receiver = getUser(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit(
        "reactionUpdated",
        message
      );
    }

  });

  socket.on("pinMessage", ({ conversation, receiverId }) => {

    const receiver = getUser(receiverId);

    if (receiver) {
      io.to(receiver.socketId).emit(
        "pinnedMessageUpdated",
        conversation
      );
    }

  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});