import { Fragment } from "react";
import { useTheme } from "../context/ThemeContext";

const escapeRegExp = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const HighlightedText = ({ text = "", search }) => {
  const { theme } = useTheme();

  if (!search?.trim()) return text;

  const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part.toLowerCase() === search.toLowerCase() ? (
            <span
              style={{
                background: "#FFD54F",
                color: "#000",
                padding: "1px 2px",
                borderRadius: 3,
                fontWeight: 600,
              }}
            >
              {part}
            </span>
          ) : (
            part
          )}
        </Fragment>
      ))}
    </>
  );
};

export default HighlightedText;