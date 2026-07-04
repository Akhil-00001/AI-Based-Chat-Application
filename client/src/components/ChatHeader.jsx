import { useTheme } from "../context/ThemeContext";
import aiIcon from "../assets/ai.png"
import searchIcon from "../assets/search.svg"
const ChatHeader = ({ name, isOnline, isTyping, aiSettings, setShowAISettings,
  pinnedMessage,
  onPinnedClick,
  toggleSearch, onUnpin }) => {
  const { theme } = useTheme();
  const styles = {
    header: {
      padding: "16px 20px",
      borderBottom: `1px solid ${theme.border}`,
      background: theme.panelBg,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: {
      margin: 0,
      fontSize: "18px",
      color: theme.userBg,
    },
    status: {
      margin: "4px 0 0",
      color: theme.messageBubble,
      fontSize: "13px",
    },
  };
  return (
    <>
      <div style={styles.header}>
        <div>
          <h3 style={styles.name}>{name}</h3>

          {name !== "Select a user" && (
            <p
              style={{
                ...styles.status,
                color: isOnline
                  ? theme.onlineText
                  : theme.offlineText,
              }}
            >
              {isTyping
                ? "Typing..."
                : isOnline
                  ? "Online"
                  : "Offline"}
            </p>
          )}
        </div>

        {name !== "Select a user" && (
          <div

            style={{
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "20px",
              background: theme.inputBg,
              border: `1px solid ${theme.border}`,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                onClick={toggleSearch}
                style={{
                  cursor: "pointer",
                  fontSize: 18,
                  userSelect: "none",
                }}
              >
                <img src={searchIcon} style={{width:"20px"}} alt="" />
              </div>

              <div
                onClick={() => setShowAISettings(true)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  background: theme.inputBg,
                  color:theme.textSecondary,
                  border: `1px solid ${theme.inputBorder}`,
                  fontSize: "13px",
                  fontWeight: "600",
                  display:"flex",
                  gap:"4px",
                  alignContent:"center",

                  alignItems:"center"
                }}
              >
                <img src={aiIcon} style={{width:"20px"}} alt="" /> <span> {aiSettings.enabled ? " AI ON" : " AI OFF"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {pinnedMessage && (
        <div
          style={{
            padding: "10px 16px",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.inputBg,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            onClick={onPinnedClick}
            style={{
              flex: 1,
              cursor: "pointer",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#f5b301",
                marginBottom: 2,
              }}
            >
              📌 Pinned Message
            </div>

            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 13,
                color: theme.textSecondary,
              }}
            >
              {pinnedMessage.text ||
                pinnedMessage.originalText ||
                "📎 Attachment"}
            </div>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onUnpin();
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: 18,
              transition: ".2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "rgba(255,255,255,.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "transparent";
            }}
          >
            ✕
          </div>
        </div>
      )}
    </>
  );
};



export default ChatHeader;