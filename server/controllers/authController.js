const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const Otp = require("../models/Otp");
const { sendOTPEmail } = require("../services/emailService");
const otpGenerator = require("otp-generator");
const PasswordResetOtp = require("../models/PasswordReset");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Already registered?
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    // Remove previous OTP if any
    await Otp.findOneAndDelete({ email });

    // Save OTP
    await Otp.create({
      email,
      name,
      password: hashedPassword,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      lastOtpSentAt: new Date(),
    });

    // Send email
    await sendOTPEmail(email, otp, name);

    return res.status(200).json({
      message: "OTP sent successfully",
      email,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) return res.status(400).json({ message: "All Credentials are required." });

    const user = await User.findOne({ email });
    if (!user) res.status(400).json({ message: "Invalid Credentials." });

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) return res.status(400).json({ message: "Invalid Credentials." });


    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login Successful", token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getall = async (req, res) => {
  const arr = await User.find()
  return res.status(200).json(arr);

}

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const otpDoc = await Otp.findOne({ email });

    if (!otpDoc) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    // Expired
    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ email });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Wrong OTP
    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Extra safety
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      await Otp.deleteOne({ email });

      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name: otpDoc.name,
      email: otpDoc.email,
      password: otpDoc.password,
    });

    // Delete OTP document
    await Otp.deleteOne({ email });

    // Login
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Registration Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const otpDoc = await Otp.findOne({ email });

    if (!otpDoc) {
      return res.status(404).json({
        message: "No pending registration found",
      });
    }

    // Server-side cooldown
    const secondsPassed =
      (Date.now() - otpDoc.lastOtpSentAt.getTime()) / 1000;

    if (secondsPassed < 30) {
      return res.status(429).json({
        message: `Please wait ${Math.ceil(
          30 - secondsPassed
        )} seconds before requesting another OTP.`,
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });


    otpDoc.otp = otp;
    otpDoc.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpDoc.lastOtpSentAt = new Date();

    await otpDoc.save();



    await sendOTPEmail(email, otp, otpDoc.name);

    return res.status(200).json({
      message: "OTP resent successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otpDoc = await PasswordResetOtp.findOne({ email });

    // Server-side cooldown
    if (otpDoc) {
      const secondsPassed =
        (Date.now() - otpDoc.lastOtpSentAt.getTime()) / 1000;

      if (secondsPassed < 30) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            30 - secondsPassed
          )} seconds before requesting another OTP.`,
        });
      }
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    await PasswordResetOtp.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        lastOtpSentAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: true,
      }
    );

    await sendOTPEmail(email, otp, user.name);

    return res.status(200).json({
      message: "Password reset OTP sent successfully.",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const otpDoc = await PasswordResetOtp.findOne({ email });

    if (!otpDoc) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    // Expired
    if (otpDoc.expiresAt < new Date()) {
      await PasswordResetOtp.deleteOne({ email });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Wrong OTP
    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    otpDoc.verified = true;
    await otpDoc.save();

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check OTP verification record
    const otpDoc = await PasswordResetOtp.findOne({ email });

    if (!otpDoc || !otpDoc.verified) {
      return res.status(400).json({
        message: "OTP verification required",
      });
    }

    // OTP expired
    if (otpDoc.expiresAt < new Date()) {
      await PasswordResetOtp.deleteOne({ email });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      await PasswordResetOtp.deleteOne({ email });

      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = hashedPassword;

    await user.save();

    // Remove OTP document
    await PasswordResetOtp.deleteOne({ email });

    return res.status(200).json({
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getall,
  getMe,
  verifyOtp,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};