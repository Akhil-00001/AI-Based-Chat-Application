const express = require("express");
const { registerUser, loginUser, getall, getMe, verifyOtp, resendOtp, forgotPassword,
    verifyResetOtp,
    resetPassword, } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/get", getall);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;