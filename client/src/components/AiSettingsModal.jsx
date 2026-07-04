import { color } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const LANGUAGES = [
  "Original",
  "English",
  "Hinglish",
  "Hindi",
  "Japanese",
  "Spanish",
  "French",
];


const AISettingsModal = ({
  open,
  onClose,
  settings,
  setSettings,
  onSave,
}) => {
  const { theme } = useTheme();

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {/* <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "420px",
          borderRadius: "16px",
          padding: "24px",
          background: theme.panelBg,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h2 style={{ marginTop: 0 ,color:theme.textSecondary}}>
           AI Translation
        </h2>

        <label style={{color:theme.textSecondary}}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                enabled: e.target.checked,
              }))
            }
          />

          Enable AI
        </label>

        <br />
        <br />

        <label style={{color:theme.textSecondary}}>Language</label>

        <select
          value={settings.language}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              language: e.target.value,
            }))
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
            marginBottom: "16px",
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang}>
              {lang}
            </option>
          ))}
        </select>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: "24px",
          }}
        >
          <button onClick={onClose}>
            Cancel
          </button>

          <button onClick={onSave}>
            Save
          </button>
        </div>
      </div> */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          borderRadius: 16,
          padding: 24,
          background: theme.panelBg,
          border: `1px solid ${theme.border}`,
          boxShadow: "0 12px 32px rgba(0,0,0,.18)",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 6,
            color: theme.textPrimary,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          AI Translation
        </h2>

        <p
          style={{
            margin: "0 0 24px",
            color: theme.textSecondary,
            fontSize: 14,
          }}
        >
          Automatically translate incoming messages into your preferred language.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                color: theme.textPrimary,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Enable Translation
            </div>

            <div
              style={{
                fontSize: 13,
                color: theme.textSecondary,
              }}
            >
              Translate received messages automatically.
            </div>
          </div>

          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                enabled: e.target.checked,
              }))
            }
          />
        </div>

        <label
        
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
            color: theme.textPrimary,
          }}
        >
          Preferred Language
        </label>

        <select

          disabled={!settings.enabled}
          value={settings.language}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              language: e.target.value,
            }))
          }
          style={{
            width: "100%",
            height: 44,
            padding: "0 12px",
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            background: theme.inputBg,
            color: theme.textPrimary,
            outline: "none",
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang}>{lang}</option>
          ))}
        </select>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 30,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: "transparent",
              color: theme.textPrimary,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: theme.accent,
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;