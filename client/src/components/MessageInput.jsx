import { useRef, useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import loading from "../assets/loading.gif"
import adjusts from "../assets/adjusts.png"
import attachIcon from "../assets/file.png"
import microIcon from "../assets/microphone.png"
import stickerIcon from "../assets/sticker.png"
import recordingIcon from "../assets/stop-button.png"
import crossIcon from "../assets/cross.png"

const MessageInput = ({
  value,
  onChange,
  onSend,
  selectedAttachment,
  setSelectedAttachment,
  showEmojiPicker,
  setShowEmojiPicker,
  replyMessage,
  setReplyMessage,
  editMessage,
  setEditMessage,
  isRecording,
  cancelRecording,
  startRecording,
  recordingTime,
  stopRecording,
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const [rewriteTone, setRewriteTone] = useState("Grammar");
  const [improving, setImproving] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const toneMenuRef = useRef(null);
  const [previousDraft, setPreviousDraft] = useState("");
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef(null);


  const tones = [
    "Grammar",
    "Friendly",
    "Professional",
    "Formal",
    "Funny",
    "Confident",
    "Polite",
  ];

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  const handleRewrite = async () => {
    if (!value.trim()) return;

    try {
      setImproving(true);
      setPreviousDraft(value);
      const res = await API.post("/ai/rewrite", {
        text: value,
        tone: rewriteTone,
      });
      onChange(res.data.text);
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }

      setShowUndo(true);

      undoTimeoutRef.current = setTimeout(() => {
        setShowUndo(false);
      }, 6000);
    } catch (err) {
      console.error("Rewrite failed:", err);
    } finally {
      setImproving(false);
    }
  };

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!selectedAttachment) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedAttachment);

    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedAttachment]);

  useEffect(() => {
    if (!editMessage) return;

    inputRef.current?.focus();

    const len = inputRef.current.value.length;

    inputRef.current.setSelectionRange(len, len);

  }, [editMessage]);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {

      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        toneMenuRef.current &&
        !toneMenuRef.current.contains(event.target)
      ) {
        setShowToneMenu(false);
      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const preview = editMessage || replyMessage;

  const styles = {
    imageButton: {
      padding: "0 14px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "20px",
      background: theme.inputBg,
    },

    preview: {
      maxHeight: "120px",
      borderRadius: "8px",
      marginBottom: "8px",
    },
    wrapper: {
      display: "flex",
      gap: "10px",
      padding: "14px 16px",
      borderTop: `1px solid ${theme.border}`,
      background: theme.inputBg,
      position: "relative",
    },
    input: {
      flex: 1,
      padding: "12px",
      fontSize: "14px",
      border: `1px solid ${theme.inputBorder}`,
      borderRadius: "8px",
      color: theme.inputText,
      background: theme.inputBg,
      outline: "none",
    },
    button: {
      padding: "12px 18px",
      cursor: "pointer",
      border: "none",
      borderRadius: "8px",
      background: theme.sendButtonBg,
      color: theme.sendButtonText,
      fontWeight: "500",
    },
  };

  return (
    <>
      {selectedAttachment && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: `1px solid ${theme.border}`,
            background: theme.inputBg,
          }}
        >
          {selectedAttachment.type.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt="preview"
              style={styles.preview}
            />
          ) : selectedAttachment.type.startsWith("audio/") ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  🎤 Voice Message Ready
                </div>

                <audio
                  controls
                  src={previewUrl}
                  style={{
                    width: "100%",
                  }}
                />
              </div>

              <button
                onClick={() => setSelectedAttachment(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 20,
                  color: theme.textSecondary,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px",
                borderRadius: "10px",
                border: `1px solid ${theme.border}`,
                background: theme.panelBg,
              }}
            >
              <div style={{ fontSize: 34 }}>📄</div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {selectedAttachment.name}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: theme.textSecondary,
                  }}
                >
                  {(selectedAttachment.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showEmojiPicker && (
        <div
          ref={pickerRef}
          style={{
            position: "absolute",
            bottom: "75px",
            left: "70px",
            zIndex: 1000,
          }}
        >
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onChange(value + emojiData.emoji);
              setShowEmojiPicker(false);
            }}
          />
        </div>
      )}
      {(editMessage || replyMessage) && (
        <div
          style={{
            padding: "10px 15px",
            borderTop: `1px solid ${theme.border}`,
            background: theme.inputBg,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "600",
                color: theme.primary,
                fontSize: "13px",
              }}
            >
              {editMessage ? "✏ Editing Message" : "↩ Replying to"}
            </div>

            <div
              style={{
                fontSize: "13px",
                color: theme.textSecondary,
              }}
            >
              {preview.text
                ? preview.text
                : preview.attachment
                  ? preview.attachment.type === "image"
                    ? "📷 Photo"
                    : preview.attachment.type === "video"
                      ? "🎥 Video"
                      : preview.attachment.type === "audio"
                        ? "🎤 Voice Message"
                        : "📄 " + preview.attachment.name
                  : "Message"}
            </div>
          </div>

          <button
            onClick={() => {
              if (editMessage) {
                setEditMessage(null);
                onChange("");
              } else {
                setReplyMessage(null);
              }
            }}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: "pointer",
              color: theme.textSecondary,
            }}
          >
            ✕
          </button>
        </div>
      )}
      <div style={{ ...styles.wrapper, position: "relative" }}>
        <button
          style={styles.imageButton}
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={attachIcon} style={{ width: "30px" }} alt="" />
        </button>
        <button
          style={styles.imageButton}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <img src={stickerIcon} style={{ width: "20px" }} alt="" />
        </button>

        {!isRecording ? (
          <button onClick={startRecording} style={{ border: "none", background: "transparent" }}>
            <img src={microIcon} style={{ width: "20px" }} alt="" />
          </button>
        ) : (
          <button onClick={stopRecording} style={{ border: "none", background: "transparent" }}>
            <img src={recordingIcon} style={{ width: "20px" }} alt="" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
          hidden
          onChange={(e) => {
            if (e.target.files[0]) {
              setSelectedAttachment(e.target.files[0]);
            }
          }}
        />
        {!isRecording ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                style={styles.input}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              {value.trim() && (
                <>
                  <div
                    ref={toneMenuRef}
                    style={{
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={() =>
                        setShowToneMenu((prev) => !prev)
                      }
                      style={{
                        ...styles.button,
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0 14px",
                        background: "#7c3aed",
                      }}
                    >
                      ✨ {rewriteTone}
                    </button>

                    <AnimatePresence>
                      {showToneMenu && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                            scale: 0.96,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: 8,
                            scale: 0.96,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 30,
                          }}
                          style={{
                            position: "absolute",
                            bottom: "110%",
                            right: 0,
                            minWidth: 230,
                            width: "max-content",
                            background: theme.panelBg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: 10,
                            overflow: "hidden",
                            zIndex: 9999,
                            boxShadow: "0 10px 25px rgba(0,0,0,.15)",
                          }}
                        >
                          {tones.map((tone) => (
                            <div
                              key={tone}
                              onClick={() => {
                                setRewriteTone(tone);
                                // setShowToneMenu(false);
                              }}
                              style={{
                                padding: "10px 14px",
                                cursor: "pointer",
                                background:
                                  rewriteTone === tone
                                    ? theme.primary
                                    : "transparent",
                                color:
                                  rewriteTone === tone
                                    ? theme.textPrimary
                                    : theme.textMuted,
                              }}
                            >
                              {tone}
                            </div>
                          ))}

                          <div
                            style={{
                              borderTop: `1px solid ${theme.border}`,
                            }}
                          />

                          <div
                            onClick={async () => {
                              if (improving) return;

                              setShowToneMenu(false);
                              await handleRewrite();
                            }}
                            style={{
                              padding: "12px",
                              cursor: improving ? "not-allowed" : "pointer",
                              fontWeight: 600,
                              color: improving ? theme.textMuted : "#000",
                              opacity: improving ? 0.7 : 1,
                              transition: "0.2s",
                              background: theme.inputPlaceholder,
                              borderRadius: "4px",
                            }}
                          >
                            <span style={{
                              display: "flex",
                              alignItems: "center", gap: "4px"
                            }}><img src={adjusts} style={{ width: "30px" }} alt="" /> <span>Improve Message</span></span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              <button
                style={styles.button}
                onClick={onSend}
              >
                Send
              </button>
              <AnimatePresence>
                {showUndo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: "absolute",

                      bottom: "100%",
                      right: 10,

                      marginBottom: 10,

                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: theme.panelBg,
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 15px 40px rgba(0,0,0,.18)",
                      zIndex: 10000,
                    }}
                  >
                    <span>✨ Message improved</span>

                    <button
                      onClick={() => {
                        onChange(previousDraft);
                        setShowUndo(false);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#7c3aed",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Undo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px",
              borderRadius: "10px",
              background: theme.panelBg,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#e53935",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#e53935",
                }}
              />

              Recording...

              <span
                style={{
                  color: theme.textSecondary,
                }}
              >
                {recordingTime}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
              }}
            >
              <button
                onClick={cancelRecording}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                <img src={crossIcon} style={{ width: "20px" }} alt="" />
              </button>

              <button
                onClick={stopRecording}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ✔
              </button>
            </div>
          </div>
        )}

      </div>

    </>);
};



export default MessageInput;

/*
{replyMessage && (
        
      )} */