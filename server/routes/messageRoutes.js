const express = require("express");
const {
  sendMessage,
  getMessages,
  deleteMessage,
  reactToMessage,
  editMessage,
  forwardMessage,
} = require("../controllers/messageController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");
upload
const router = express.Router();

router.post("/", upload.single("attachment"), sendMessage);
router.get("/:conversationId", protect, getMessages);
router.put("/:messageId/delete", deleteMessage);
router.patch("/:id/reaction", reactToMessage);
router.patch("/:id/edit", editMessage);
router.post("/forward",protect,forwardMessage);

module.exports = router;