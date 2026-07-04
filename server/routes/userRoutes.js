const express = require("express");
const { getAllUsers, updateProfile ,removeProfilePicture } = require("../controllers/userController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.put(
    "/profile",
    protect,
    upload.single("profilePic"),
    updateProfile
);
router.get("/", getAllUsers);
router.delete("/remove-profile-picture", protect, removeProfilePicture);
// router,this.patch("/ai-settings",protect,updateAISettings);

module.exports = router;