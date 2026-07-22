import logo from "../../assets/logo.png";
import useResponsive from "../hooks/useResponsive";

export default function AuthLeftPanel() {
  const { isMobile } = useResponsive();
  const styles = {
    left: {
      width: "45%",
      minWidth: 520,

      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      // padding: "70px",
    },

    content: {
      width: "100%",
      maxWidth: 520,

      display: "flex",
      flexDirection: "column",

      height: "100%",
    },

    logo: {
      width: isMobile ? 44 : 88,
      // marginBottom: isMobile ? 15 : 26,
    },

    title: {
      margin: 0,
      fontSize: isMobile ? 30 : 58,
      fontWeight: 700,
      letterSpacing: "-1px",
      color: "#222",
    },

    tagline: {
      marginTop: isMobile ? 10 : 18,
      fontSize: isMobile ? 14 : 21,
      lineHeight: 1.7,
      color: "#666",
      maxWidth: 420,
    },

    group: {
      display : "flex",
      gap:20,
      flexDirection : isMobile ? "row" : "column",
    },

    features: {
      marginTop: 70,

      display: isMobile ? "none" : "flex",
      flexDirection: "column",
      gap: 32,
    },

    feature: {
      display: "flex",
      alignItems: "flex-start",
      gap: 18,
    },

    icon: {
      width: 56,
      height: 56,

      borderRadius: 16,

      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      fontSize: 24,

      background: "#ffffff",

      boxShadow: "0 10px 28px rgba(0,0,0,.05)",
    },

    featureTitle: {
      margin: 0,
      fontSize: 18,
      color: "#2a2a2a",
      fontWeight: 600,
    },

    featureText: {
      marginTop: 7,
      color: "#666",
      lineHeight: 1.7,
      fontSize: 15,
      maxWidth: 340,
    },

    footer: {
      marginTop: "auto",

      color: "#999",
      fontSize: 14,

      paddingTop: 80,
    },
  };
  function Feature({ icon, title, text }) {
    return (
      <div style={styles.feature}>
        <div style={styles.icon}>
          {icon}
        </div>

        <div>
          <h3 style={styles.featureTitle}>
            {title}
          </h3>

          <p style={styles.featureText}>
            {text}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div style={styles.left}>
      <div style={styles.content}>
        {/* Logo & Branding */}
        <div>
          <div style={styles.group} >
            <img
              src={logo}
              alt="Chat Up"
              style={styles.logo}
            />

            <h1 style={styles.title}>
              Chat Up
            </h1>
          </div>


          <p style={styles.tagline}>
            The future of global conversation.
          </p>
        </div>

        {/* Features */}
        <div style={styles.features}>

          <Feature
            icon="🌍"
            title="AI Translation"
            text="Talk naturally while everyone reads in their preferred language."
          />

          <Feature
            icon="✨"
            title="Smart Rewrite"
            text="Rewrite messages instantly in different tones before sending."
          />

          <Feature
            icon="🔒"
            title="Private & Secure"
            text="Designed with privacy, reliability and speed at its core."
          />

        </div>
      </div>
    </div>
  );
}



