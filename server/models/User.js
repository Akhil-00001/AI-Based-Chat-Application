const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required field."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        },
        minlength: 6,
    },
    profilePic: {
        type: String,
        default: "",
    },

    profilePicPublicId: {
        type:String,
        default:"",
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: null,
    },
    googleId: {
        type: String,
        default: null,
    },
    

    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    
},
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);