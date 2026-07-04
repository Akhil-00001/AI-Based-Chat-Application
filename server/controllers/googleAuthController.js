

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const generateToken  = require("../utils/generateToken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Credential missing",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email_verified) {
      return res.status(400).json({
        message: "Email not verified",
      });
    }

    let user = await User.findOne({ email });

    // Existing email/password account
    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
      }

    //   user.provider = "google";
      user.profilePic = picture;

      await user.save();
    }
    // First Google login
    else {
      user = await User.create({
        name,
        email,
        profilePic: picture,
        googleId: sub,
        provider: "google",
      });
    }

    const token =  generateToken(user._id);

    return res.status(200).json({
      message: "Login Successful",
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
      message: "Google Login Failed",
    });
  }
};

module.exports = {
  googleLogin,
};