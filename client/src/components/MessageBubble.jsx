import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import AttachmentBubble from "./AttachmentBubble";
import EmojiPicker from "emoji-picker-react";
import HighlightedText from "./HighlightedText";

const MessageBubble = ({ text, image, attachment, isOwnMessage, time, deliveredAt, onImageClick, seenAt, isGrouped, isGroupedWithNext, onContextMenu, replyTo, onReplyClick,
  reactions,
  onReact,
  messageId,
  isHighlighted, deleted, edited, searchQuery }) => {
  const pickerRef = useRef(null);
  const { theme } = useTheme();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);



  const groupedReactions = Object.values(
    (reactions || []).reduce((acc, r) => {
      if (!acc[r.emoji]) {
        acc[r.emoji] = {
          emoji: r.emoji,
          count: 0,
        };
      }

      acc[r.emoji].count++;

      return acc;
    }, {})
  );

  const [ignoreHover, setIgnoreHover] = useState(false);

  const handleEnter = () => {

    if (ignoreHover) return;

    clearTimeout(hideTimeout.current);

    setShowReactionBar(true);

  }


  useEffect(() => {

    if (!ignoreHover) return;

    const timer = setTimeout(() => {

      setIgnoreHover(false);

    }, 300);

    return () => clearTimeout(timer);

  }, [ignoreHover]);

  const [showReactionBar, setShowReactionBar] = useState(false);

  const quickReactions = [
    "👍",
    "❤️",
    "😂",
    "😮",
    "😢",
    "🔥",
  ];
  const hideTimeout = useRef(null);
  const handleLeave = () => {
    hideTimeout.current = setTimeout(() => {
      if (!showEmojiPicker) {
        setShowReactionBar(false);
      }
    }, 150);
  };


  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
        setShowReactionBar(false);
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

  if (deleted) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: isOwnMessage ? "flex-end" : "flex-start",
          marginTop: isGrouped ? "2px" : "10px",
          color:theme.textMuted,
        }}>
        🗑 {isOwnMessage
          ? "You deleted this message"
          : "This message was deleted"}
      </div>
    );
  }
  return (
    <div

      onContextMenu={onContextMenu}
      style={{
        display: "flex",
        position: "relative",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        marginTop: isGrouped ? "2px" : "10px",
      }}
    >
      <AnimatePresence>
        {!isOwnMessage && showReactionBar && (
          <motion.div
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.9,
            }}
            transition={{
              duration: 0.18,
            }}
            style={{
              position: "absolute",
              top: -24,
              right: isOwnMessage ? 0 : "auto",
              left: isOwnMessage ? "auto" : 0,
              display: "flex",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              background: theme.panelBg,
              border: `1px solid ${theme.border}`,
              boxShadow: "0 8px 24px rgba(0,0,0,.18)",
              zIndex: 100,
            }}
          >
            {quickReactions.map((emoji) => (
              <span
                key={emoji}
                style={{
                  cursor: "pointer",
                  fontSize: 20,
                  transition: "transform .15s",
                }}
                onClick={() => { onReact(messageId, emoji), setShowReactionBar(false) }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {emoji}
              </span>
            ))}

            <div style={{ position: "relative" }}>
              <span
                style={{
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 700,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmojiPicker((prev) => !prev);
                }}
              >
                ➕
              </span>

              {showEmojiPicker && (
                <div
                  ref={pickerRef}
                  style={{
                    position: "absolute",
                    top: "25px",
                    left: "40px",
                    zIndex: 1000,
                  }}
                >
                  <EmojiPicker
                    width={320}
                    height={400}
                    onEmojiClick={(emojiData) => {

                      setIgnoreHover(true);

                      onReact(messageId, emojiData.emoji);

                      setShowEmojiPicker(false);

                      setShowReactionBar(false);

                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{

          maxWidth: "340px",
          minWidth: image ? "220px" : "120px",
          padding: "10px 12px 8px",
          borderTopRightRadius: isOwnMessage
            ? isGrouped
              ? "6px"
              : "14px"
            : "14px",
          borderBottomRightRadius: isOwnMessage
            ? isGroupedWithNext
              ? "6px"
              : "14px"
            : "14px",

          borderTopLeftRadius: !isOwnMessage
            ? isGrouped
              ? "6px"
              : "14px"
            : "14px",
          borderBottomLeftRadius: !isOwnMessage
            ? isGroupedWithNext
              ? "6px"
              : "14px"
            : "14px",
          background: isHighlighted
            ? "#4f9cff40"
            : isOwnMessage
              ? theme.messageOwnBg
              : theme.messageOtherBg,
          border: `1px solid ${theme.borderBubble}`,
          boxShadow: theme.bubbleShadow,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          wordBreak: "break-word",
          position: "relative"
        }}
      >
        <>
          <AttachmentBubble
            attachment={attachment}
            image={image}
            onImageClick={onImageClick}
          />

          {replyTo && (
            <div
              onClick={() => onReplyClick(replyTo._id)}

              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(79,156,255,0.18)";
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              style={{
                cursor: "pointer",
                borderLeft: "3px solid #4f9cff",
                paddingLeft: "8px",
                marginBottom: "6px",
                opacity: 0.9,
                background: "rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "6px 8px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "12px",
                }}
              >
                Reply
              </div>

              <div
                style={{
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {replyTo.image
                  ? "📷 Photo"
                  : replyTo.text}
              </div>
            </div>
          )}

          {text && (
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.4",
              }}
            >
              <HighlightedText
                text={text}
                search={searchQuery}
              />
            </div>
          )}

        </>

        {time && (<>
          {groupedReactions.length > 0 && (
            <div

              style={{
                display: "flex",
                gap: 6,
                marginTop: 4,
                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                flexWrap: "wrap",
              }}
            >
              <AnimatePresence>
                {groupedReactions.map((reaction) => (
                  <motion.div
                    onClick={() => onReact(messageId, reaction.emoji)}
                    key={reaction.emoji}
                    initial={{
                      scale: 0.6,
                      opacity: 0,
                    }}
                    animate={{
                      scale: [0.6, 1.15, 1],
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 18,
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                    }}
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
                    style={{
                      background: theme.panelBg,
                      borderRadius: 999,
                      padding: "2px 8px",
                      bottom: "-10px",
                      left: "0px",
                      position: "absolute",
                      fontSize: 20,
                      border: `1px solid ${theme.border}`,
                      cursor: "pointer",
                    }}
                  >
                    {reaction.emoji}
                    {reaction.count > 1 && ` ${reaction.count}`}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              alignSelf: "flex-end",
              fontSize: "11px",
              color: theme.textSecondary,
              lineHeight: 1,
            }}
          >
            <span>{time}</span>

            {edited && (
              <span
                style={{
                  fontSize: 10,
                  opacity: .7,
                  marginLeft: 4,
                }}
              >
                (edited)
              </span>
            )}

            {isOwnMessage && (
              <span
                style={{
                  color: seenAt
                    ? theme.messageSeenColor
                    : theme.messageTickColor,
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {seenAt ? "✓✓" : deliveredAt ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        </>
        )}
      </div>


    </div>
  );
};

export default MessageBubble;
