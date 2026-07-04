export default function AuthCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>
        {title}
      </h2>

      {subtitle && (
        <p style={styles.subtitle}>
          {subtitle}
        </p>
      )}

      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    maxWidth: 470,

    background: "#fff",

    borderRadius: 26,

    padding: "42px",

    border: "1px solid #E8E1D8",

    boxShadow:
      "0 20px 60px rgba(0,0,0,.08)",
  },

  title: {
    margin: 0,
    marginBottom: 8,

    fontSize: 34,

    fontWeight: 700,

    color: "#222",
  },

  subtitle: {
    margin: 0,

    marginBottom: 34,

    color: "#666",

    fontSize: 16,

    lineHeight: 1.6,
  },

  content: {
    display: "flex",

    flexDirection: "column",

    gap: 18,
  },
};