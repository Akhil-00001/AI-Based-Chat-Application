import { useTheme } from "../context/ThemeContext";

const ConversationItem = ({ profilePic, name, lastMessage, time, unreadCount, isSelected, onClick, isTyping }) => {
  const { theme } = useTheme();
  const styles = {
    item: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "14px 16px",
      borderBottom: `1px solid ${theme.softBorder}`,
      cursor: "pointer",
      transition: "0.2s",
    },
    avatar: {
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      background: theme.avatarBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
    },
    avatar1: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    border: "2px solid rgba(255,255,255,.08)",
},
    content: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      margin: 0,
      fontSize: "15px",
      color: theme.textPrimary,
    },
    lastMessage: {
      margin: "4px 0 0",
      color: theme.textSecondary,
      fontSize: "13px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    unreadBadge: {
      minWidth: "22px",
      height: "22px",
      borderRadius: "999px",
      background: theme.accent,
      color: theme.panelBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "600",
      padding: "0 6px",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
    },
    bottomRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "8px",
      marginTop: "4px",
    },
    time: {
      fontSize: "12px",
      color: theme.timestampText,
      whiteSpace: "nowrap",
    },
  };
  return (
    <div
      style={{
        ...styles.item,
        background: isSelected ? theme.selectedConversation : theme.panelBg,
      }}
      onClick={onClick}
    >
      {profilePic === "" ? <div style={styles.avatar}>{name?.charAt(0).toUpperCase()}</div> : <img
        src={profilePic}
        alt={name}
        style={styles.avatar1}
      />}

      <div style={styles.content}>
        <div style={styles.topRow}>
          <h4 style={styles.name}>{name}</h4>
          {time && <span style={styles.time}>{time}</span>}
        </div>

        <div style={styles.bottomRow}>
          <p
            style={{
              ...styles.lastMessage,
              color: isTyping ? theme.accent : theme.textSecondary,
              fontStyle: isTyping ? "italic" : "normal",
              fontWeight: isTyping ? "500" : "400",
            }}
          >
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <span style={styles.unreadBadge}>{unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};



export default ConversationItem;