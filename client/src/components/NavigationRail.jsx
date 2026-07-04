import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toggleIcon from "../assets/brightness.png"
import userIcon from "../assets/user.png"
import logoutIcon from "../assets/logout.png"
const NavigationRail = ({
  //   user,
  //   isDark,
  //   toggleTheme,
  //   onLogout,
  onProfileClick,
}) => {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = {
    container: {
      width: 70,
      minWidth: 70,

      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",

      padding: "18px 0",

      borderRight: "1px solid rgba(255,255,255,.08)",
      background: theme.rail,
    },

    top: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
      alignItems: "center",
    },

    bottom: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
      alignItems: "center",
    },

    brand: {
      fontSize: 28,
      opacity: 0.8,
      userSelect: "none",
    },

    button: {
      width: 46,
      height: 46,

      border: "none",
      borderRadius: "50%",

      cursor: "pointer",
      color: theme.logout,
      background: "transparent",

      fontSize: 22,

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      transition: ".25s",
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: "50%",
      objectFit: "cover",
    },
  };
  return (
    <div style={styles.container}>
      {/* Top */}
      <div style={styles.top}>
        <button
          style={styles.button}
          onClick={onProfileClick}
          title="Profile"
        >
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt=""
              style={styles.avatar}
            />
          ) : (
            <img src={userIcon} width={20} alt="" />
          )}
        </button>

        <button
          style={styles.button}
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          <img src={toggleIcon} style={{width:"30px"}} alt="" />
        </button>
      </div>


      {/* Bottom */}
      <div style={styles.bottom}>
        <button
          style={styles.button}
          onClick={logout}
          title="Logout"
        >
          <img src={logoutIcon} style={{color:theme.logout}} width={30} alt="" />
        </button>
      </div>
    </div>
  );
};



export default NavigationRail;