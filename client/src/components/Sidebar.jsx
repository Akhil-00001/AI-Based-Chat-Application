import ConversationItem from "./ConversationItem";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/logo.png"
import useResponsive from "./hooks/useResponsive";

const Sidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  allUsers,
  showUserPicker,
  setShowUserPicker,
  conversationsLoading,
  onStartNewChat,
  newChatPanelRef,
  searchQuery,
  setSearchQuery,
  typingConversationIds,
  activeTab,
  changeTab,
  requests,
  newRequestCount,
  newChatSearch,
  setNewChatSearch,
}) => {
  const { isMobile } = useResponsive();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = {
    tabContainer: {
      display: "flex",
      borderBottom: `1px solid ${theme.border}`,
    },

    tab: {
      flex: 1,
      padding: "12px",
      textAlign: "center",
      cursor: "pointer",
      fontWeight: 600,
    },

    activeTab: {
      borderBottom: `3px solid ${theme.accent}`,
      color: theme.accent,
    },
    sectionTitle: {
      padding: "10px 16px",
      fontWeight: "700",
      color: theme.textSecondary,
      background: theme.panelBg,
      borderBottom: `1px solid ${theme.border}`,
    },
    sidebar: {
      width: "100%",
      maxWidth: isMobile ? "100%" : 320,
      borderRight: `1px solid ${theme.border}`,
      background: theme.panelBg,
      display: "flex",
      flexDirection: "column",
    },
    top: {
      padding: "14px 16px 10px",
      borderBottom: `1px solid ${theme.border}`,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    email: {
      margin: "4px 0 0",
      fontSize: "13px",
      color: theme.textSecondary,
    },
    list: {
      flex: 1,
      overflowY: "auto",
    },
    emptyText: {
      padding: "16px",
      color: theme.textMuted,
    },
    buttonRow: {
      display: "flex",
      gap: "8px",
    },
    userPicker: {
      borderBottom: `1px solid ${theme.border}`,
      padding: "12px",
      maxHeight: "220px",
      overflowY: "auto",
      background: theme.pickerBg,
    },
    userPickerTitle: {
      margin: "0 0 10px 0",
      fontSize: "15px",
      color: theme.textPrimary,
    },
    userPickerItem: {
      padding: "10px",
      border: `1px solid ${theme.pickerItemBorder}`,
      borderRadius: "8px",
      marginBottom: "8px",
      cursor: "pointer",
      background: theme.messageOtherBg,
    },
    userPickerName: {
      fontWeight: "600",
      marginBottom: "4px",
    },
    userPickerEmail: {
      fontSize: "13px",
      color: theme.textSecondary,
    },
    actionBtn: {
      flex: 1,
      padding: "8px 12px",
      cursor: "pointer",
      border: `1px solid ${theme.border}`,
      borderRadius: "8px",
      background: theme.panelBg,
      color: theme.textPrimary,
      fontWeight: "500",
    },

    primaryActionBtn: {
      background: theme.accent,
      color: "#ffffff",
      border: `1px solid ${theme.accent}`,
    },

    themeBtn: {
      background: isDark ? theme.selectedConversationBg : theme.panelBg,
    },
    searchWrapper: {
      // padding: "12px 16px",
      borderBottom: `1px solid ${theme.border}`,
      background: theme.panelBg,
    },

    searchInput: {
      width: "100%",
      padding: "10px 34px 10px 12px",
      border: `1px solid ${theme.inputBorder}`,
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      background: theme.inputBg,
      color: theme.inputText,
      boxSizing: "border-box",
    },
    clearSearchBtn: {
      position: "absolute",
      right: "10px",
      width: "20px",
      height: "20px",
      top: "50%",
      right: "10%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      color: theme.textMuted,
      cursor: "pointer",
      fontSize: "16px",
      padding: 0,
      lineHeight: 1,
    },
    searchInputWrapper: {
      padding: "10px 16px",
      borderBottom: `1px solid ${theme.border}`,
      position:"relative",
    }
  };


  const source =
    activeTab === "chats"
      ? conversations
      : requests;

  const query = newChatSearch
    .trim()
    .toLowerCase();

  const filteredUsers = allUsers.filter((u) => {

    if (!query) return false;

    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );

  }).sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(query);
    const bStarts = b.name.toLowerCase().startsWith(query);

    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    return a.name.localeCompare(b.name);
  });;

  const displayedConversations = source.filter((conversation) => {

    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    const name =
      conversation.otherUser?.name?.toLowerCase() || "";

    const last =
      conversation.lastMessage?.text?.toLowerCase() || "";

    return (
      name.includes(query) ||
      last.includes(query)
    );

  });

  return (
    <div style={styles.sidebar}>
      <div ref={newChatPanelRef}>
        <div style={styles.top}>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: ".5px",
              color: theme.textPrimary,
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2px", background: "transparent" }}><img src={logo} width="40" alt="" /> <span> Chat Up. . . </span></div>
          </h2>
          <div style={styles.buttonRow}>
            <button
              onClick={() => { setNewChatSearch(""), setShowUserPicker((prev) => !prev) }}
              style={{
                ...styles.actionBtn,
                ...(showUserPicker ? styles.primaryActionBtn : { borderColor: theme.border }),
              }}
            >
              {showUserPicker ? "Close" : "New Chat"}
            </button>

          </div>
        </div>


        <AnimatePresence>
          {showUserPicker && (
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -15,
                scale: 0.96,
              }}
              transition={{
                duration: 0.22,
                ease: "easeOut",
              }}
              style={styles.userPicker}
            >
              <h4 style={styles.userPickerTitle}>
                Start a new chat
              </h4>

              <input
                type="text"
                placeholder="Search users..."
                value={newChatSearch}
                onChange={(e) =>
                  setNewChatSearch(e.target.value)
                }
                style={styles.searchInput}
              />

              {filteredUsers.length === 0 ? (
                <p style={styles.emptyText}>No users found</p>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    style={styles.userPickerItem}
                    onClick={() => onStartNewChat(u)}
                  >
                    <div style={styles.userPickerName}>{u.name}</div>
                    <div style={styles.userPickerEmail}>{u.email}</div>
                  </div>
                ))
              )}

            </motion.div>
          )}
        </AnimatePresence>
        <div style={styles.searchInputWrapper}>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />

          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery("")}
              style={styles.clearSearchBtn}
            >
              ×
            </button>
          )}
        </div>

      </div>

      <div style={styles.list}>

        <div style={styles.tabContainer}>

          <div
            onClick={() => changeTab("chats")}
            style={{
              ...styles.tab,
              ...(activeTab === "chats"
                ? styles.activeTab
                : { color: theme.textPrimary }),
            }}
          >
            Chats
          </div>

          <div
            onClick={() => changeTab("requests")}
            style={{
              ...styles.tab,
              ...(activeTab === "requests"
                ? styles.activeTab
                : { color: theme.textPrimary }),
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
              <span> Requests</span>

              {requests.length > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 12,
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {requests.length}
                </span>
              )}

              {newRequestCount > 0 && (
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: "#ef4444",
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>
          </div>

        </div>

        {conversationsLoading ? (
          <p style={styles.emptyText}>
            Loading conversations...
          </p>
        ) : displayedConversations.length === 0 ? (
          <p style={styles.emptyText}>
            {activeTab === "chats"
              ? "No conversations"
              : "No chat requests"}
          </p>
        ) : (
          displayedConversations.map((conversation) => {

            let preview;

            if (activeTab === "chats" && typingConversationIds?.has(conversation._id)) {
              preview = "Typing...";
            } else if (conversation.lastMessage?.deleted) {
              preview =
                String(conversation.lastMessage.sender) === String(user._id)
                  ? "🗑 You deleted this message"
                  : "🗑 This message was deleted";
            } else {
              preview = conversation.lastMessage?.text
                ? String(conversation.lastMessage.sender) === String(user._id)
                  ? `You: ${conversation.lastMessage.text}`
                  : conversation.lastMessage.text
                : "No messages yet";
            }
            return (
              <ConversationItem
                key={conversation._id}
                name={conversation.otherUser?.name || "Unknown User"}
                profilePic={
                  conversation.otherUser?.profilePic ||
                  ""
                }
                lastMessage={
                  preview.length > 35
                    ? preview.slice(0, 35) + "..."
                    : preview
                }

                time={
                  conversation.lastMessage?.createdAt
                    ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : ""
                }

                unreadCount={Number(conversation.unreadCounts?.[user._id] || 0)}
                isSelected={selectedConversation?._id === conversation._id}
                onClick={() => onSelectConversation(conversation)}
                isTyping={typingConversationIds?.has(conversation._id)}
              />
            );
          })
        )}

      </div>
    </div>
  );
};



export default Sidebar;