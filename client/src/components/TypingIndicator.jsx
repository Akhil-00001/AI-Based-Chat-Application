import { useTheme } from "../context/ThemeContext";

const TypingIndicator = () => {
  const { theme } = useTheme();

  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "flex-start",
      marginTop: "4px",
    },
    bubble: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "10px 14px",
      borderRadius: "14px",
      background: theme.messageOtherBg,
      border: `1px solid ${theme.borderBubble}`,
      boxShadow: theme.bubbleShadow,
      maxWidth: "fit-content",
    },
    dot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: theme.textMuted,
      animation: "typingBounce 1.2s infinite ease-in-out",
    },
  };

  return (
    <>
      <style>
        {`
          @keyframes typingBounce {
            0%, 80%, 100% {
              transform: scale(0.7);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={styles.wrapper}>
        <div style={styles.bubble}>
          <span style={{ ...styles.dot, animationDelay: "0s" }} />
          <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
          <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
        </div>
      </div>
    </>
  );
};

export default TypingIndicator;