import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import TypingIndicator from "../components/TypingIndicator";
import ImageViewer from "../components/ImageViewer";
import AISettingsModal from "../components/AiSettingsModal";
import SearchBar from "../components/Searchbar";
import { useCallback } from "react";
import NavigationRail from "../components/NavigationRail";
import ProfileModal from "../components/ProfileModel";
import replyIcon from "../assets/reply.png"
import deleteIcon from "../assets/delete.png"
import editIcon from "../assets/edit.png"
import copyIcon from "../assets/copy.png"
import pinIcon from "../assets/pin.png"
import forwardIcon from "../assets/forward.png"
import { AnimatePresence, color, motion } from "framer-motion";
import ForwardModal from "../components/ForwardModal";
import useResponsive from "../components/hooks/useResponsive";
import { HiOutlineBars3 } from "react-icons/hi2";


const Chat = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const socket = useRef();
  const messagesEndRef = useRef(null);
  const newChatPanelRef = useRef(null);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const [typingConversationIds, setTypingConversationIds] = useState(new Set());
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [openedImage, setOpenedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messageRefs = useRef({});
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [timerId, setTimerId] = useState(null)
  const [aiSettings, setAISettings] = useState({
    enabled: false,
    language: "Original",
  });
  const [editMessage, setEditMessage] = useState(null);
  const selectedConversationRef = useRef(null);
  const [toast, setToast] = useState("");
  const [dontscroll, setDontscroll] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [isNewChat, setIsNewChat] = useState(false);
  const [newRequestCount, setNewRequestCount] = useState(0);
  const [messageSearch, setMessageSearch] = useState("");
  const [matchedMessageIds, setMatchedMessageIds] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [pinMessage, setPinMessage] = useState(null)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const searchInputRef = useRef(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [selectedChats, setSelectedChats] = useState([]);
  const [mobileView, setMobileView] = useState("sidebar");
  const [showRail, setShowRail] = useState(false);
  const railRef = useRef(null);
  const menuButtonRef = useRef(null);
  const socketUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";

  //message helper
  const updateMessage = (messageId, updater) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? updater(msg)
          : msg
      )
    );
  };


  //ai
  const saveAISettings = async () => {
    try {
      const res = await API.patch(
        `/conversations/${selectedConversation._id}/ai-settings`,
        aiSettings
      );


      setSelectedConversation(res.data);

      setShowAISettings(false);

    } catch (err) {
      console.error(err);
    }
  };
  //ai reset on conversation change
  useEffect(() => {

    if (!selectedConversation) return;

    const setting =
      selectedConversation.aiSettings.find(
        s => s.user === user._id
      );

    setAISettings(
      setting || {
        enabled: false,
        language: "Original",
      });

  }, [selectedConversation]);
  //ai end

  //socket part start
  //socket connection
  useEffect(() => {
    socket.current = io(socketUrl, {
      transports: ["websocket"],
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [socketUrl]);
  //socket new user addition
  useEffect(() => {
    if (!socket.current || !user?._id) return;

    socket.current.emit("addUser", user._id);

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.current.on("getOnlineUsers", handleOnlineUsers);

    return () => {
      socket.current?.off("getOnlineUsers", handleOnlineUsers);
    };
  }, [user]);
  //socket message
  useEffect(() => {
    if (!socket.current) return;

    const handleGetMessage = async (data) => {
      const newMessage = data;
      socket.current.emit("messageDelivered", {
        messageId: newMessage._id,
        senderId: newMessage.sender,
      });

      const isCurrentConversationOpen =
        selectedConversationRef.current?._id === data.conversationId;


      if (isCurrentConversationOpen) {
        await API.patch(`/conversations/${data.conversationId}/read`, {
          userId: user._id,
        });
        socket.current.emit("messageSeen", {
          messageId: data._id,
          senderId: data.sender,
        });


        setMessages((prev) => [...prev, newMessage]);
      }

      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv._id !== data.conversationId) return conv;

          const currentUnread = Number(conv.unreadCounts?.[user._id] || 0);

          return {
            ...conv,
            lastMessage: {
              text: data.text || (data.attachment
                ? `📎 ${data.attachment.name}`
                : "📷 Photo"),
              sender: data.sender,
              createdAt: data.createdAt,
            },
            unreadCounts: {
              ...(conv.unreadCounts || {}),
              [user._id]: isCurrentConversationOpen
                ? 0
                : currentUnread + 1,
            },
          };
        });

        const active = updated.find(
          (c) => c._id === data.conversationId
        );

        return active
          ? [active, ...updated.filter((c) => c._id !== data.conversationId)]
          : updated;
      });
    };

    socket.current.on("getMessage", handleGetMessage);

    return () => {
      socket.current.off("getMessage", handleGetMessage);
    };
  }, [user._id]);

  //messaage delivered
  useEffect(() => {
    if (!socket.current) return;

    const handleMessageDelivered = ({ messageId, deliveredAt }) => {
      updateMessage(messageId, (msg) => ({
        ...msg,
        deliveredAt,
      }));
    };

    socket.current.on("messageDelivered", handleMessageDelivered);

    return () => {
      socket.current.off("messageDelivered", handleMessageDelivered);
    };
  }, []);
  //messaage seen
  useEffect(() => {
    if (!socket.current) return;

    const handleMessageSeen = ({ messageId, seenAt }) => {
      // setMessages((prev) =>
      //   prev.map((msg) =>
      //     String(msg._id) === String(messageId)
      //       ? {
      //         ...msg,
      //         seenAt,
      //       }
      //       : msg
      //   )
      // );
      updateMessage(messageId, (msg) => ({
        ...msg,
        seenAt,
      }));
    };

    socket.current.on("messageSeen", handleMessageSeen);

    return () => {
      socket.current.off("messageSeen", handleMessageSeen);
    };
  }, []);

  //typing indicator
  useEffect(() => {
    if (!socket.current) return;

    const handleTyping = ({ senderId, conversationId }) => {
      setTypingConversationIds((prev) => {
        const updated = new Set(prev);
        updated.add(conversationId);
        return updated;
      });
      if (
        selectedConversation &&
        selectedConversation._id === conversationId &&
        selectedUser &&
        selectedUser._id === senderId
      ) {
        setIsOtherUserTyping(true);
      }
    };

    const handleStopTyping = ({ senderId, conversationId }) => {
      setTypingConversationIds((prev) => {
        const updated = new Set(prev);
        updated.delete(conversationId);
        return updated;
      });
      if (
        selectedConversation &&
        selectedConversation._id === conversationId &&
        selectedUser &&
        selectedUser._id === senderId
      ) {
        setIsOtherUserTyping(false);
      }
    };

    socket.current.on("typing", handleTyping);
    socket.current.on("stopTyping", handleStopTyping);

    return () => {
      socket.current?.off("typing", handleTyping);
      socket.current?.off("stopTyping", handleStopTyping);
    };
  }, [selectedConversation, selectedUser]);

  //message delete listener
  useEffect(() => {

    if (!socket.current) return;

    const handleDelete = ({ messageId, conversation }) => {

      updateMessage(messageId, (msg) => ({
        ...msg,
        deleted: true,
      }));

      setConversations(prev =>
        prev.map(conv =>
          conv._id === conversation._id
            ? {
              ...conv,
              lastMessage: conversation.lastMessage,
            }
            : conv
        )
      );

      setSelectedConversation(prev => {

        if (!prev) return prev;

        if (prev._id !== conversation._id)
          return prev;

        return {
          ...prev,
          lastMessage: conversation.lastMessage,
        };

      });

    };

    socket.current.on(
      "messageDeleted",
      handleDelete
    );

    return () => {
      socket.current.off(
        "messageDeleted",
        handleDelete
      );
    };

  }, []);

  //reaction listner
  useEffect(() => {

    const handleReactionUpdate = (updatedMessage) => {


      updateMessage(updatedMessage._id, () => updatedMessage);

    };

    socket.current.on(
      "reactionUpdated",
      handleReactionUpdate
    );

    return () => {

      socket.current.off(
        "reactionUpdated",
        handleReactionUpdate
      );

    };

  }, []);
  //edit messaage listener
  useEffect(() => {
    if (!socket.current) return;
    const handleEditMessage = async (updatedMessage) => {

      updateMessage(updatedMessage._id, () => updatedMessage);

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === updatedMessage.conversationId
            ? {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                text: updatedMessage.text,
              },
            }
            : conv
        )
      );
      setSelectedConversation((prev) =>
        prev?._id === updatedMessage.conversationId
          ? {
            ...prev,
            lastMessage: {
              ...prev.lastMessage,
              text: updatedMessage.text,
            },
          }
          : prev
      );
    };

    socket.current.on("messageEdited", handleEditMessage);

    return () => {
      socket.current.off("messageEdited", handleEditMessage);
    };
  }, [user._id])

  //pin listener
  useEffect(() => {
    if (!socket.current) return;

    const handlePinnedMessage = (conversation) => {

      if (
        selectedConversationRef.current?._id === conversation._id
      ) {
        setSelectedConversation(conversation);
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id
            ? {
              ...conv,
              pinnedMessage: conversation.pinnedMessage,
            }
            : conv
        )
      );
    };

    socket.current.on(
      "pinnedMessageUpdated",
      handlePinnedMessage
    );

    return () => {
      socket.current.off(
        "pinnedMessageUpdated",
        handlePinnedMessage
      );
    };
  }, []);


  //socket part end

  //select conversation ref Update
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  //typeindicator utility
  useEffect(() => {
    setIsOtherUserTyping(false);
  }, [selectedConversation]);

  //conversation fetch
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setConversationsLoading(true);

        const [chatRes, requestRes] = await Promise.all([
          API.get(`/conversations/${user._id}/chats`),
          API.get(`/conversations/${user._id}/requests`),
        ]);

        setConversations(chatRes.data);
        setRequests(requestRes.data);

      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setConversationsLoading(false);
      }
    };

    if (user?._id) {
      fetchConversations();
    }
  }, [user]);

  //user fetch
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await API.get(`/users?exclude=${user._id}`);
        setAllUsers(res.data);
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    };

    if (user?._id) {
      fetchAllUsers();
    }
  }, [user]);
  //conversation select
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setSelectedUser(conversation.otherUser);
    if (isMobile) {
      setMobileView("chat");
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    try {
      await API.patch(`/conversations/${conversation._id}/read`, {
        userId: user._id,
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id
            ? {
              ...conv,
              unreadCounts: {
                ...(conv.unreadCounts || {}),
                [user._id]: 0,
              },
            }
            : conv
        )
      );

      // socket.current.emit("messageDelivered", {
      //   messageId: data.messageId,
      //   senderId: data.senderId,
      // });
      setSearchQuery("");
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  //accept conversation
  const handleAcceptRequest = async () => {
    try {

      const res = await API.put(
        `/conversations/${selectedConversation._id}/accept`,
        {
          userId: user._id,
        }
      );

      const updatedConversation = res.data;

      setSelectedConversation(updatedConversation);

      setRequests(prev =>
        prev.filter(
          c => c._id !== updatedConversation._id
        )
      );

      setConversations(prev => [
        {
          ...updatedConversation,
          otherUser: selectedUser,
        },
        ...prev.filter(
          c => c._id !== updatedConversation._id
        )
      ]);

    } catch (err) {
      console.error(err);
    }
  };

  //reject conversation
  const handleRejectRequest = async () => {
    try {

      await API.delete(
        `/conversations/${selectedConversation._id}/reject`
      );

      setRequests(prev =>
        prev.filter(
          c => c._id !== selectedConversation._id
        )
      );

      setSelectedConversation(null);
      setSelectedUser(null);
      setMessages([]);

    } catch (err) {
      console.error(err);
    }
  };


  //newchat
  const handleStartNewChat = (clickedUser) => {

    setSelectedConversation(null);
    setSelectedUser(clickedUser);

    setMessages([]);
    setIsNewChat(true);
    setMobileView("chat")

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    isTypingRef.current = false;

    setShowUserPicker(false);

    setSearchQuery("");

  };

  //request listener
  useEffect(() => {
    if (!socket.current) return;

    const handleNewRequest = (conversation) => {
      setRequests(prev => {
        const exists = prev.some(c => c._id === conversation._id);
        if (exists) return prev;

        return [conversation, ...prev];
      });
      if (activeTab !== "requests") {
        setNewRequestCount(prev => prev + 1);
      }
    };

    socket.current.on("newRequest", handleNewRequest);

    return () => {
      socket.current.off("newRequest", handleNewRequest);
    };
  }, []);



  //message fetch
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await API.get(`/messages/${selectedConversation._id}`);
        setMessages(res.data);
        const ids = res.data
          .filter(
            (msg) =>
              String(msg.sender) !== String(user._id) &&
              !msg.deleted &&
              msg.text?.trim()
          )
          .map((msg) => msg._id);


        const unseenMessages = res.data.filter(
          (msg) =>
            String(msg.sender) !== String(user._id) &&
            !msg.seenAt
        );


        unseenMessages.forEach((msg) => {
          socket.current.emit("messageSeen", {
            messageId: msg._id,
            senderId: msg.sender,
          });
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    };

    if (selectedConversation?._id) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation?._id]);

  //messaage input
  const handleMessageChange = (value) => {
    setNewMessage(value);

    if (!socket.current || !selectedConversation || !selectedUser) return;

    if (value.trim()) {
      if (!isTypingRef.current) {
        socket.current.emit("typing", {
          senderId: user._id,
          receiverId: selectedUser._id,
          conversationId: selectedConversation._id,
        });
        isTypingRef.current = true;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.current?.emit("stopTyping", {
          senderId: user._id,
          receiverId: selectedUser._id,
          conversationId: selectedConversation._id,
        });
        isTypingRef.current = false;
      }, 1200);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTypingRef.current) {
        socket.current.emit("stopTyping", {
          senderId: user._id,
          receiverId: selectedUser._id,
          conversationId: selectedConversation._id,
        });
        isTypingRef.current = false;
      }
    }
  };

  //message send
  const handleSendMessage = async () => {
    // if ((!newMessage.trim() && !selectedAttachment) || !selectedConversation || !selectedUser) return;
    if (
      (!newMessage.trim() && !selectedAttachment)
      ||
      !selectedUser
    )
      return;

    const trimmedText = newMessage.trim();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
      socket.current.emit("stopTyping", {
        senderId: user._id,
        receiverId: selectedUser._id,
        conversationId: selectedConversation?._id,
      });
      isTypingRef.current = false;
    }
    try {
      if (editMessage) {
        if (newMessage.trim() === "") return;
        const updatedText = newMessage.trim();

        const oldText = editMessage.text;

        if (updatedText === oldText) {
          setEditMessage(null);
          setNewMessage("");
          return;
        }

        const res = await API.patch(
          `/messages/${editMessage._id}/edit`,
          {
            userId: user._id,
            text: newMessage.trim(),
          }
        );

        // Update my UI immediately
        updateMessage(res.data.message._id, (msg) =>
          res.data.message);
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === res.data.conversation._id
              ? {
                ...conv,
                lastMessage: res.data.conversation.lastMessage,
              }
              : conv
          )
        );

        setSelectedConversation((prev) =>
          prev?._id === res.data.conversation._id
            ? res.data.conversation
            : prev
        );

        // Notify the other user
        socket.current.emit("editMessage", {
          message: res.data.message,
          receiverId: selectedUser._id,
        });

        setEditMessage(null);
        setNewMessage("");

        return;
      }
      const formData = new FormData();

      if (selectedConversation) {
        formData.append(
          "conversationId",
          selectedConversation._id
        );
      }

      formData.append(
        "senderId",
        user._id
      );

      formData.append(
        "receiverId",
        selectedUser._id
      );
      formData.append("text", newMessage.trim());

      if (selectedAttachment) {
        formData.append("attachment", selectedAttachment);
      }

      if (replyMessage) {
        formData.append("replyTo", replyMessage._id);
      }

      const res = await API.post("/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      const saveMessage = res.data.message;
      const conversation = res.data.conversation;

      socket.current.emit("sendMessage", {
        message: saveMessage,
        receiverId: selectedUser._id,
      });

      if (!selectedConversation) {
        setSelectedConversation(conversation);

        socket.current.emit("requestSent", {
          conversation,
          receiverId: selectedUser._id,
        });

        setConversations((prev) => {
          const exists = prev.some((c) => c._id === conversation._id);
          if (exists) return prev;

          return [
            {
              ...conversation,
              otherUser: selectedUser,
            },
            ...prev,
          ];
        });
      }
      setIsNewChat(false);
      setMessages((prev) => [...prev, saveMessage]);

      moveConversationToTop(conversation._id, {
        text: conversation.lastMessage.text,
        sender: conversation.lastMessage.sender,
        createdAt: conversation.lastMessage.createdAt,
      });
      if (!selectedConversation) {
        setSelectedConversation(conversation);
      }
      setNewMessage("");
      setSelectedAttachment(null);
      setReplyMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  //handle forward message
  const handleForward = async () => {
    try {

      const responses = await Promise.all(
        selectedChats.map((chat) =>
          API.post("/messages/forward", {
            messageId: forwardMessage._id,
            conversationId: chat._id,
            senderId: user._id,
          })
        )
      );

      responses.forEach((res) => {

        const conversation = res.data.conversation;
        const message = res.data.message;

        // Update sidebar
        moveConversationToTop(conversation._id, {
          text: conversation.lastMessage.text,
          sender: conversation.lastMessage.sender,
          createdAt: conversation.lastMessage.createdAt,
          deleted: conversation.lastMessage.deleted,
        });

        // If this conversation is currently open
        if (selectedConversation?._id === conversation._id) {
          setMessages((prev) => [...prev, message]);
        }

        // Replace conversation object so unread count,
        // last message etc. stay in sync.
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversation._id
              ? {
                ...conv,
                ...conversation,
              }
              : conv
          )
        );

      });

      setSelectedChats([]);
      setForwardMessage(null);
      setShowForwardModal(false);

    } catch (err) {
      console.log(err);
    }
  };
  //messaage reply
  useEffect(() => {

    const close = () => setContextMenu(null);

    window.addEventListener("click", close);

    return () =>
      window.removeEventListener("click", close);

  }, []);

  //message delete
  const handleDeleteMessage = async () => {
    try {
      const messageId = contextMenu.message._id;

      const res = await API.put(
        `/messages/${messageId}/delete`,
        {
          userId: user._id,
        }
      );

      socket.current.emit("deleteMessage", {
        messageId,
        conversation: res.data.conversation,
        receiverId: selectedUser._id,
      });
      setDontscroll(true);
      updateMessage(messageId, (msg) => ({
        ...msg,
        deleted: true,
        deletedForEveryone: true,
        text: "",
        originalText: "",
        image: "",
        attachment: {},
      }));
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === res.data.conversation._id
            ? {
              ...conv,
              lastMessage: res.data.conversation.lastMessage,
            }
            : conv
        )
      );
      setSelectedConversation((prev) => {
        if (!prev || prev._id !== res.data.conversation._id) {
          return prev;
        }

        return {
          ...prev,
          lastMessage: res.data.conversation.lastMessage,
        };
      });

      setContextMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  //time formatter
  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  //voice message start
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstart = () => {
        setRecordingTime(0);
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      };

      recorder.start();

    } catch (err) {
      console.error(err);
    }
  };

  //voice message stop
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) return;

    recorder.onstop = () => {
      clearInterval(timerRef.current);

      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const file = new File(
        [blob],
        `voice-${Date.now()}.webm`,
        {
          type: "audio/webm",
        }
      );

      setSelectedAttachment(file);

      recorder.stream
        .getTracks()
        .forEach((track) => track.stop());

      setIsRecording(false);
    };

    recorder.stop();
  };

  //cancel voice recording
  const cancelRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) return;

    clearInterval(timerRef.current);

    recorder.stream
      .getTracks()
      .forEach((track) => track.stop());

    recorder.stop();

    audioChunksRef.current = [];

    setRecordingTime(0);

    setIsRecording(false);
  };

  //message reaction 
  const handleReaction = async (messageId, emoji) => {
    try {
      const res = await API.patch(
        `/messages/${messageId}/reaction`,
        {
          userId: user._id,
          emoji,
        }
      );

      // Update my own UI immediately
      setDontscroll(true);
      updateMessage(messageId, (msg) =>
        res.data
      );

      // Notify the other user
      socket.current.emit("addReaction", {
        message: res.data,
        receiverId: selectedUser._id,
      });

    } catch (err) {
      console.error(err);
    }
  };

  //messaage pin 
  const handlePinMessage = async () => {
    try {
      const res = await API.patch(
        `/conversations/${selectedConversation._id}/pin`,
        {
          messageId: contextMenu.message._id,
        }
      );

      setSelectedConversation(res.data);
      socket.current.emit("pinMessage", {
        conversation: res.data,
        receiverId: selectedUser._id,
      });
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === res.data._id
            ? {
              ...conv,
              pinnedMessage: res.data.pinnedMessage,
            }
            : conv
        )
      );

      setContextMenu(null);

      setToast("Message pinned");
    } catch (err) {
      console.error(err);
    }
  };

  //message unpin
  const handleUnpinMessage = async () => {
    try {

      const res = await API.patch(
        `/conversations/${selectedConversation._id}/unpin`
      );

      setSelectedConversation(res.data);

      setConversations(prev =>
        prev.map(conv =>
          conv._id === res.data._id
            ? {
              ...conv,
              pinnedMessage: null,
            }
            : conv
        )
      );

      socket.current.emit("pinMessage", {
        conversation: res.data,
        receiverId: selectedUser._id,
      });

      setContextMenu(null);

      setToast("Message unpinned");

    } catch (err) {
      console.error(err);
    }
  };

  //message searchQuery

  useEffect(() => {
    if (!messageSearch.trim()) {
      setMatchedMessageIds([]);
      setCurrentMatchIndex(0);
      return;
    }

    const query = messageSearch.toLowerCase();

    const ids = messages
      .filter((msg) => {
        return (
          ((!msg.deleted) && (msg.text || "").toLowerCase().includes(query) ||
            (msg.originalText || "").toLowerCase().includes(query) ||
            (msg.ai?.generated || "").toLowerCase().includes(query) ||
            (msg.attachment?.name || "").toLowerCase().includes(query))
        );
      })
      .map((msg) => msg._id);

    setMatchedMessageIds(ids);
    setCurrentMatchIndex(0);
  }, [messageSearch, messages]);

  //sub search query handler next result 
  const handleNextResult = () => {
    if (!matchedMessageIds.length) return;

    setCurrentMatchIndex((prev) =>
      prev === matchedMessageIds.length - 1
        ? 0
        : prev + 1
    );
  };
  //sub search query handler prev result 
  const handlePreviousResult = () => {
    if (!matchedMessageIds.length) return;

    setCurrentMatchIndex((prev) =>
      prev === 0
        ? matchedMessageIds.length - 1
        : prev - 1
    );
  };

  //scroll to searched messaage
  useEffect(() => {
    if (!matchedMessageIds.length) return;

    scrollToMessage(
      matchedMessageIds[currentMatchIndex]
    );
  }, [currentMatchIndex]);

  //keyboard search shortcut
  useEffect(() => {
    if (!showSearch) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowSearch(false);
        setMessageSearch("");
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();

        if (e.shiftKey) {
          handlePreviousResult();
        } else {
          handleNextResult();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    showSearch,
    matchedMessageIds,
    currentMatchIndex,
  ]);

  //toast
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 1500);

    return () => clearTimeout(timer);
  }, [toast]);

  //menu item 
  const menuItem = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all .18s ease",
    userSelect: "none",
    color: theme.textPrimary,
  };

  //handleclick outside 
  useEffect(() => {
    function handleClick(e) {
      if (
        railRef.current &&
        !railRef.current.contains(e.target) &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setShowRail(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  const menuDivider = {
    height: "1px",
    background: theme.border,
  };

  const changeTab = (tab) => {
    setActiveTab(tab);

    if (tab === "requests") {
      setNewRequestCount(0);
    }
  };

  //conversation to top
  const moveConversationToTop = (conversationId, lastMessageData) => {
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv._id === conversationId
          ? {
            ...conv,
            lastMessage: {
              text: lastMessageData.text,
              sender: lastMessageData.sender,
              createdAt: lastMessageData.createdAt,
            },
          }
          : conv
      );

      const activeConversation = updated.find((conv) => conv._id === conversationId);
      const remainingConversations = updated.filter(
        (conv) => conv._id !== conversationId
      );

      return activeConversation
        ? [activeConversation, ...remainingConversations]
        : updated;
    });
  };

  //scrolldown
  useEffect(() => {
    if (!dontscroll)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setDontscroll(false);
  }, [messages, isOtherUserTyping, mobileView]);

  //reply scrolldown
  const scrollToMessage = (messageId) => {
    const element = messageRefs.current[messageId];

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    if (timerId) clearTimeout(timerId)
    setHighlightedMessage(messageId);

    setTimerId(setTimeout(() => {
      setHighlightedMessage(null);
    }, 1000));
  };

  const isSelectedUserOnline = selectedUser
    ? onlineUsers.some((onlineUser) => onlineUser.userId === selectedUser._id) : false;

  const existingConversationUserIds = new Set(
    conversations.map((conv) => conv.otherUser?._id)
  );

  const availableUsersForNewChat = allUsers.filter(
    (u) => !existingConversationUserIds.has(u._id)
  );

  //new chat panel listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUserPicker &&
        newChatPanelRef.current &&
        !newChatPanelRef.current.contains(event.target)
      ) {
        setShowUserPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserPicker]);

  //date separator
  const formatMessageDateLabel = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(messageDate, today)) return "Today";
    if (isSameDay(messageDate, yesterday)) return "Yesterday";

    return messageDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  // styles
  const styles = {
    page: {
      display: "flex",
      height: "100vh",
      width: "100%",
      background: theme.pageBg,
      overflow:"hidden",
    },
    chatSection: {
      flex: 1,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      background: theme.panelBg,
    },
    messagesContainer: {
      flex: 1,
      padding: "20px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      background: theme.chatBg,
    },
    placeholder: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: theme.textSecondary,
      textAlign: "center",
    },
    dateSeparatorWrapper: {
      display: "flex",
      justifyContent: "center",
      margin: "12px 0 8px",
      position: "sticky",
      top: "8px",
      zIndex: 5,
      pointerEvents: "none",
    },
    dateSeparator: {
      background: theme.dateChipBg,
      color: theme.dateChipText,
      fontSize: "12px",
      padding: "4px 10px",
      borderRadius: "999px",
    },
  };
  return (
    <div style={styles.page}>
      <>
        {!showRail && (!isMobile || mobileView === "sidebar") && <button
          ref={menuButtonRef}
          onClick={() => setShowRail(prev => !prev)}
          style={{
            position: "fixed",
            left: 15,
            top: 15,
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            zIndex: 1001,
            background: theme.panelBg,
            boxShadow: "0 8px 25px rgba(0,0,0,.2)",
          }}
        >
          <HiOutlineBars3 stroke={theme.textPrimary} size={24} />
        </button>}

        {showRail && (
          <div
            onClick={() => setShowRail(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.2)",
              zIndex: 999,
            }}
          />
        )}

        <AnimatePresence>
          {showRail && (
            <motion.div
              ref={railRef}
              initial={{ x: -90 }}
              animate={{ x: 0 }}
              exit={{ x: -90 }}
              transition={{ duration: .2 }}
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1000,
              }}
            >
              <NavigationRail
                onProfileClick={() =>
                  setShowProfileModal(true)
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
      {(!isMobile || mobileView == "sidebar") && (
        <Sidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          allUsers={availableUsersForNewChat}
          showUserPicker={showUserPicker}
          setShowUserPicker={setShowUserPicker}
          conversationsLoading={conversationsLoading}
          onStartNewChat={handleStartNewChat}
          newChatPanelRef={newChatPanelRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typingConversationIds={typingConversationIds}
          activeTab={activeTab}
          changeTab={changeTab}
          newRequestCount={newRequestCount}
          requests={requests}
          newChatSearch={newChatSearch}
          setNewChatSearch={setNewChatSearch}
        />
      )}

      {(!isMobile || mobileView == "chat") && (
        <div style={styles.chatSection}>
          <ChatHeader name={selectedUser ? selectedUser.name : "Select a user"} aiSettings={aiSettings} setShowAISettings={setShowAISettings} isOnline={isSelectedUserOnline} isTyping={isOtherUserTyping} pinnedMessage={selectedConversation?.pinnedMessage}
            onPinnedClick={() =>
              scrollToMessage(selectedConversation?.pinnedMessage?._id)
            } toggleSearch={() => { setShowSearch((prev) => !prev); setMessageSearch("") }
            } onUnpin={handleUnpinMessage} setMobileView={setMobileView} />
          <SearchBar
            open={showSearch}
            value={messageSearch}
            onChange={setMessageSearch}
            onClose={() => {
              setShowSearch(false);
              setMessageSearch("");
            }}
            resultCount={matchedMessageIds.length}
            currentIndex={currentMatchIndex}
            onNext={handleNextResult}
            onPrev={handlePreviousResult}
            inputRef={searchInputRef}
          />

          {
            selectedConversation &&
            selectedConversation.status === "pending" &&
            selectedConversation.requestedBy !== user._id && (

              <div
                style={{
                  padding: 16,
                  borderBottom: `1px solid ${theme.border}`,
                  background: theme.panelBg,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <div>

                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                      color: theme.textPrimary,
                    }}
                  >
                    📩 Chat Request
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: theme.textSecondary,
                    }}
                  >
                    Accepting lets both of you exchange messages.
                  </div>

                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexDirection:isMobile ? "column" : "row",
                  }}
                >

                  <button
                    style={{ outline: `2px solid ${theme.border}`, color: theme.sendButtonText, background: theme.accent, borderRadius: 4, width: 80, height: 35 }}
                    onClick={handleAcceptRequest}
                  >
                    Accept
                  </button>

                  <button
                    style={{ outline: `2px solid ${theme.border}`, color: theme.textPrimary, background: theme.panelBg, borderRadius: 4, width: 80, height: 35 }}
                    onClick={handleRejectRequest}
                  >
                    Reject
                  </button>

                </div>

              </div>

            )}

          <div style={styles.messagesContainer}>
            {!selectedUser ? (
              <div style={styles.placeholder}>
                <h2>Select a user to start chatting</h2>
                <p>Your conversations will appear here.</p>
              </div>
            ) : messagesLoading ? (
              <div style={styles.placeholder}>
                <h3>Loading messages...</h3>
              </div>
            ) : messages.length === 0 ? (
              <div style={styles.placeholder}>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending the first message.</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const currentLabel = formatMessageDateLabel(msg.createdAt);
                  const previousLabel =
                    index > 0
                      ? formatMessageDateLabel(messages[index - 1].createdAt)
                      : null;

                  const showDateSeparator = index === 0 || currentLabel !== previousLabel;
                  const isSameSenderAsPrevious = index > 0 && messages[index - 1].sender === msg.sender &&
                    !showDateSeparator;
                  const nextMessage = messages[index + 1];

                  const nextLabel = nextMessage
                    ? formatMessageDateLabel(nextMessage.createdAt)
                    : null;

                  const isSameSenderAsNext =
                    !!nextMessage &&
                    nextMessage.sender === msg.sender &&
                    nextLabel === currentLabel;
                  return (
                    <div key={msg._id}
                      ref={(el) => (messageRefs.current[msg._id] = el)}>
                      {showDateSeparator && (
                        <div style={styles.dateSeparatorWrapper}>
                          <span style={styles.dateSeparator}>{currentLabel}</span>
                        </div>
                      )}

                      <MessageBubble
                        text={msg.text}
                        image={msg.image}
                        attachment={msg.attachment}
                        isOwnMessage={msg.sender === user._id}
                        deliveredAt={msg.deliveredAt}
                        seenAt={msg.seenAt}
                        time={msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", }) : ""}
                        isGrouped={isSameSenderAsPrevious}
                        isGroupedWithNext={isSameSenderAsNext}
                        onImageClick={setOpenedImage}
                        onContextMenu={(e) => {
                          e.preventDefault();

                          setContextMenu({
                            mouseX: e.clientX,
                            mouseY: e.clientY,
                            message: msg,
                          });
                        }}
                        replyTo={msg.replyTo}
                        onReplyClick={scrollToMessage}
                        isHighlighted={highlightedMessage === msg._id}
                        // originalText={msg.originalText}
                        // ai={msg.ai}
                        deleted={msg.deleted}
                        messageId={msg._id}
                        reactions={msg.reactions}
                        onReact={handleReaction}
                        edited={msg.edited}
                        searchQuery={searchQuery}
                      />

                    </div>
                  );
                })}
              </>
            )}
            {selectedUser && isOtherUserTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          {
            (selectedConversation || isNewChat) &&
            <MessageInput
              value={newMessage}
              onChange={handleMessageChange}
              onSend={handleSendMessage}
              selectedAttachment={selectedAttachment}
              setSelectedAttachment={setSelectedAttachment}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
              editMessage={editMessage}
              setEditMessage={setEditMessage}
              isRecording={isRecording}
              startRecording={startRecording}
              stopRecording={stopRecording}
              cancelRecording={cancelRecording}
              recordingTime={formatTime(recordingTime)}
            />}
          <ImageViewer
            image={openedImage}
            onClose={() => setOpenedImage(null)}
          />
          {contextMenu && (
            <div
              style={{
                position: "fixed",
                top: contextMenu.mouseY,
                left: contextMenu.mouseX,
                background: theme.chatBg,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                boxShadow: "0 8px 20px rgba(0,0,0,.25)",
                zIndex: 10000,
                overflow: "hidden",
                minWidth: 170,
              }}
            >
              {/* //reply */}
              <div
                onClick={() => {
                  setReplyMessage(contextMenu.message);
                  setContextMenu(null);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                style={menuItem}
              >
                <img src={replyIcon} style={{ width: 20 }} alt="" /> Reply
              </div>

              {/* forward */}
              <div
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onClick={() => {
                  setForwardMessage(contextMenu.message);
                  setShowForwardModal(true);
                  setContextMenu(null);
                }}
                style={menuItem}
              >
                <img src={forwardIcon} width={20} alt="" /> Forward
              </div>

              {/* edit */}
              {contextMenu.message.sender === user._id &&
                !contextMenu.message.deleted && (
                  <div
                    onClick={() => {
                      setEditMessage(contextMenu.message);
                      setNewMessage(
                        contextMenu.message.originalText ||
                        contextMenu.message.text
                      );
                      setContextMenu(null);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                    style={menuItem}
                  >
                    <img src={editIcon} style={{ width: 20 }} alt="" /> Edit
                  </div>
                )}
              {/* copy */}
              <div
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      contextMenu.message.originalText ||
                      contextMenu.message.text
                    );

                    setToast("Copied!");
                  } catch (err) {
                    console.error(err);
                  }

                  setContextMenu(null);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                style={menuItem}
              >
                <img src={copyIcon} style={{ width: 20 }} alt="" /> Copy
              </div>
              {/* pin */}
              <div
                onClick={handlePinMessage}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                style={menuItem}
              >
                <img src={pinIcon} style={{ width: 20 }} alt="" /> Pin Message
              </div>
              <div style={menuDivider} />
              {/* delete */}
              {contextMenu.message.sender === user._id && (
                <div
                  onClick={handleDeleteMessage}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  style={menuItem}
                >
                  <img src={deleteIcon} style={{ width: 20 }} alt="" /> Delete
                </div>
              )}

            </div>
          )
          }
          <AISettingsModal
            open={showAISettings}
            onClose={() => setShowAISettings(false)}
            settings={aiSettings}
            setSettings={setAISettings}
            onSave={saveAISettings}
          />
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            background: `${theme.panelBg}`,
            color: `${theme.textPrimary}`,
            padding:isMobile ? "8px 14px" : "10px 18px",
            borderRadius: "8px",
            zIndex: 100000,
            fontSize: "14px",
          }}
        >
          ✅ {toast}
        </div>
      )}
      <ForwardModal
        open={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          setForwardMessage(null);
        }}
        conversations={conversations}
        selectedChats={selectedChats}
        setSelectedChats={setSelectedChats}
        onForward={handleForward}
      />
    </div>
  );
};



export default Chat;

