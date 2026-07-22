import useResponsive from "../hooks/useResponsive";

export default function AuthInput({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    autoComplete,
    required = true,
}) {
    const { isMobile } = useResponsive();
    const styles = {
        wrapper: {
            display: "flex",
            flexDirection: "column",
            gap: 8,
        },

        label: {
            fontSize: 15,
            fontWeight: 600,
            color: "#444",
        },

        input: {
            height: isMobile ? 40 : 56,

            padding: "0 18px",

            borderRadius: 14,

            border: "1px solid #D9D9D9",

            outline: "none",

            fontSize: 15,

            transition: "all .2s ease",

            background: "#fff",

            color: "#222",
        },
    };
    return (
        <div style={styles.wrapper}>
            {label && (
                <label style={styles.label}>
                    {label}
                </label>
            )}

            <input
                onFocus={(e) => {
                    e.target.style.border = "1px solid #A8743B";

                    e.target.style.boxShadow =
                        "0 0 0 4px rgba(168,116,59,.15)";
                }}

                onBlur={(e) => {
                    e.target.style.border = "1px solid #D9D9D9";

                    e.target.style.boxShadow = "none";
                }}
                style={styles.input}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
            />
        </div>
    );
}

