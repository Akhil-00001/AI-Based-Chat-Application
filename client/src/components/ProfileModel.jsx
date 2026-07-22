import { useState, useEffect, useRef } from "react";
import { FaCamera, FaTimes } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import userIcon from "../assets/user.png"
import useResponsive from "./hooks/useResponsive";

export default function ProfileModal({
    open,
    onClose,
    user,
}) {
    const { login } = useAuth();
    const {isMobile} = useResponsive();
    const fileInputRef = useRef(null);

    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;

        setName(user.name);
        setPreview(user.profilePic || userIcon);
        setImage(null);
    }, [user, open]);

    const chooseImage = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const formData = new FormData();

            formData.append("name", name);

            if (image) {
                formData.append("profilePic", image);
            }

            const res = await API.put(
                "/users/profile",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            login(
                res.data.user,
                localStorage.getItem("chat-token")
            );

            onClose();
        } catch (err) {
            console.log(err);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveProfile = async () => {
        try {

            const res = await API.delete(
                "/users/remove-profile-picture"
            );

            login(
                res.data.user,
                localStorage.getItem("chat-token")
            );

            setPreview(null);
            setImage(null);

        } catch (err) {
            console.log(err);
        }
    };

    const styles = {
        overlay: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
        },

        modal: {
            width: isMobile?"300px":500,
            height:isMobile ? "400px" : "",
            background: "#1f1f28",
            borderRadius: 18,
            padding: isMobile ? 10 : 28,
            color: "white",
        },

        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isMobile ? 0 : 25,
        },

        close: {
            background: "none",
            border: "none",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
        },

        center: {
            display: "flex",
            justifyContent: "center",
            marginBottom: isMobile ? 5 : 25,
        },

        imageWrapper: {
            position: "relative",
        },

        image: {
            width:isMobile ? 100 : 150,
            height: isMobile ? 100 : 150,
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid #7c3aed",
        },

        camera: {
            position: "absolute",
            bottom: 5,
            right: 5,
            width: isMobile ? 30 : 42,
            height: isMobile ? 30 : 42,
            borderRadius: "50%",
            border: "none",
            background: "#7c3aed",
            color: "white",
            cursor: "pointer",
        },

        input: {
            width: isMobile ? "90%" : "100%",
            height: isMobile ? 30 : 46,
            marginTop: 8,
            marginBottom: isMobile ? 5 : 18,
            borderRadius: 10,
            border: "1px solid #444",
            background: "#2c2c35",
            color: "white",
            padding: "0 15px",
            boxSizing: "border-box",
        },

        footer: {
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 20,
        },

        cancel: {
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
        },

        save: {
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "#7c3aed",
            color: "white",
        },
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    style={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        style={styles.modal}
                        initial={{
                            scale: 0.9,
                            opacity: 0,
                        }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                        }}
                        exit={{
                            scale: 0.9,
                            opacity: 0,
                        }}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div style={styles.header}>
                            <h2>Profile</h2>

                            <button
                                style={styles.close}
                                onClick={onClose}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div style={styles.center}>
                            <div
                                style={styles.imageWrapper}
                            >
                                <img
                                    src={preview}
                                    alt=""
                                    style={styles.image}
                                />



                                <button
                                    style={styles.camera}
                                    onClick={() =>
                                        fileInputRef.current.click()
                                    }
                                >
                                    <FaCamera />
                                </button>

                                <button
                                    onClick={handleRemoveProfile}
                                    style={{
                                        marginTop: 12,
                                        border: "none",
                                        background: "transparent",
                                        color: "#dc2626",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        position:"absolute",
                                        bottom:"10px",
                                    }}
                                >
                                    Remove Photo
                                </button>

                                <input
                                    hidden
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={chooseImage}
                                />
                            </div>
                        </div>

                        <label>Name</label>

                        <input
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            style={styles.input}
                        />

                        <label>Email</label>

                        <input
                            value={user.email}
                            disabled
                            style={styles.input}
                        />

                        <div style={styles.footer}>
                            <button
                                style={styles.cancel}
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                style={styles.save}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}