export default function AuthButton({
  children,
  type = "button",
  onClick,
  loading = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        ...styles.button,
        ...(loading ? styles.loading : {}),
      }}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

const styles = {
  button: {
    width: "100%",
    height: 56,

    border: "none",

    borderRadius: 14,

    cursor: "pointer",

    fontSize: 16,

    fontWeight: 600,

    color: "#fff",

    background:
      "linear-gradient(135deg,#B97A3D,#9A6434)",

    transition: ".25s",

    boxShadow:
      "0 10px 30px rgba(169,116,59,.25)",
  },

  loading: {
    opacity: .75,

    cursor: "not-allowed",
  },
};