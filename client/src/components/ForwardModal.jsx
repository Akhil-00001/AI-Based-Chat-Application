import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import nouserIcon from "../assets/user.png";
export default function ForwardModal({
    open,
    onClose,
    conversations,
    selectedChats,
    setSelectedChats,
    onForward
}) {
    const { theme } = useTheme();
    const [search, setSearch] = useState("");
    const toggleConversation = (conversation) => {
        setSelectedChats(prev => {

            const exists = prev.some(
                c => c._id === conversation._id
            );

            if (exists) {
                return prev.filter(
                    c => c._id !== conversation._id
                );
            }

            return [...prev, conversation];

        });
    };

    const filtered = conversations.filter((c) => {
        const name = c.otherUser?.name?.toLowerCase() || "";
        return name.includes(search.toLowerCase());
    });


    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}

                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.45)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                    onClick={()=>{setSearch("");
                                setSelectedChats([]);onClose();}}
                >
                    <motion.div
                        initial={{ scale: .95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: .95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        layout

                        whileHover={{
                            scale: 1.015,
                        }}

                        whileTap={{
                            scale: .98,
                        }}
                        style={{
                            width: 420,
                            maxHeight: 550,
                            maxHeight: 480,
                            overflowY: "auto",
                            paddingRight: 4,
                            borderRadius: 16,
                            background: theme.panelBg,
                            border: `1px solid ${theme.border}`,
                            padding: 20,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 20,
                            }}
                        >

                            <div>

                                <div
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 700,
                                        color: theme.textPrimary,
                                    }}
                                >
                                    Forward Message
                                </div>

                                <div
                                    style={{
                                        color: theme.textSecondary,
                                        fontSize: 13,
                                        marginTop: 3,
                                    }}
                                >
                                    Select one or more conversations
                                </div>

                            </div>

                            <button onClick={()=> {
                                setSearch("");
                                setSelectedChats([]);
                                onClose()
                            }}>
                                ✕
                            </button>

                        </div>

                        <div
                            style={{
                                position: "relative",
                                marginBottom: 18,
                            }}
                        >

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                style={{
                                    width: "100%",
                                    padding: "11px 14px",
                                    borderRadius: 12,
                                    border: `1px solid ${theme.border}`,
                                    background: theme.inputBg,
                                    color: theme.textPrimary,
                                    outline: "none",
                                }}
                            />

                        </div>

                        {filtered.map((conversation) => {

                            const selected = selectedChats.some(
                                c => c._id === conversation._id
                            );

                            return (
                                <div
                                    onMouseEnter={(e) => {
                                        if (selected) return;

                                        e.currentTarget.style.background = theme.border;
                                    }}

                                    onMouseLeave={(e) => {
                                        if (selected) return;

                                        e.currentTarget.style.background = "transparent";
                                    }}
                                    key={conversation._id}
                                    onClick={() => toggleConversation(conversation)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "12px",
                                        cursor: "pointer",
                                        borderRadius: "10px",
                                        background:
                                            selected
                                                ? `${theme.panelBg}20`
                                                : "transparent",

                                        transition: "all .15s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <img
                                            src={conversation.otherUser.profilePic === "" ? nouserIcon : conversation.otherUser.profilePic}
                                            alt={conversation.otherUser.name}
                                            onError={(e) => {
                                                e.currentTarget.src = { nouserIcon };
                                            }}
                                            style={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                border: `1px solid ${theme.border}`,
                                                flexShrink: 0,
                                                background:theme.profileBg,
                                            }}
                                        />

                                        <div>
                                            <div>{conversation.otherUser.name}</div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    opacity: .7,
                                                }}
                                            >
                                                {
                                                    conversation.lastMessage?.text ||

                                                    conversation.lastMessage?.attachment?.name ||

                                                    "Attachment"
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: "50%",
                                            background: selected
                                                ? theme.primary
                                                : "transparent",

                                            border: selected
                                                ? "none"
                                                : `2px solid ${theme.border}`,

                                            display: "grid",
                                            placeItems: "center",

                                            color: "#fff",

                                            fontSize: 12,

                                            fontWeight: 700,

                                        }}
                                    >

                                        {selected && "✓"}

                                    </div>
                                </div>
                            );
                        })}
                        <button

                            disabled={!selectedChats.length}

                            onClick={onForward}

                            style={{

                                width: "100%",

                                marginTop: 18,

                                padding: "14px",

                                borderRadius: 12,

                                border: "none",

                                fontWeight: 600,

                                fontSize: 15,

                                background:
                                    selectedChats.length
                                        ? theme.primary
                                        : "#ccc",

                                color: "#fff",

                                cursor:
                                    selectedChats.length
                                        ? "pointer"
                                        : "not-allowed",

                            }}

                        >

                            Forward {selectedChats.length > 0 && `(${selectedChats.length})`}

                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}