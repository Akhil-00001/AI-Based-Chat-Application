// const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const User = require("../models/User");


const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update name
    if (req.body.name) {
      user.name = req.body.name.trim();
    }

    // Update profile picture
    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "chat-app/profile-images",
            resource_type: "image",
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      });

      user.profilePic = uploaded.secure_url;
      user.profilePicPublicId = uploaded.public_id;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};
const removeProfilePicture = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.profilePicPublicId) {
            await cloudinary.uploader.destroy(
                user.profilePicPublicId
            );
        }

        user.profilePic = "";
        user.profilePicPublicId = "";

        await user.save();

        return res.json({
            message: "Profile picture removed",
            user,
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Server Error",
        });

    }
};

const getAllUsers = async (req, res) => {
  try {
    const excludeUserId = req.query.exclude;

    let users;

    if (excludeUserId) {
      users = await User.find({ _id: { $ne: excludeUserId } }).select("-password");
    } else {
      users = await User.find().select("-password");
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  getAllUsers,updateProfile,
  removeProfilePicture,
};