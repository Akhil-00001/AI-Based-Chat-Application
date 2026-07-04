const express = require("express");
const {
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
} = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createConversation);
router.get("/:userId", getUserConversations);
router.patch("/:conversationId/read", markConversationAsRead);
router.patch("/:id/ai-settings", protect, updateAISettings);
router.get("/:userId/chats",getAcceptedConversations);
router.get("/:userId/requests",getConversationRequests);
router.put("/:id/accept",acceptConversation);
router.delete("/:id/reject",rejectConversation);
router.patch("/:id/pin", protect, pinMessage);
router.patch("/:id/unpin", protect, unpinMessage);

module.exports = router;