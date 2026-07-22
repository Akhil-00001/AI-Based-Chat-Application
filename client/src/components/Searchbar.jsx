import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import upIcon from "../assets/up.png"
import downIcon from "../assets/down.png"
import crossIcon from "../assets/cross.png"
import useResponsive from "./hooks/useResponsive";

const SearchBar = ({
  open,
  value,
  onChange,
  onClose,
  resultCount,
  currentIndex,
  onNext,
  onPrev,
  inputRef,
}) => {
  const { theme } = useTheme();
  const {isMobile} = useResponsive()
  useEffect(() => {
    if (open && inputRef?.current) {
      inputRef.current.focus();
    }
  }, [open, inputRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            overflow: "hidden",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.panelBg,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Search messages..."
              style={{
                flex: 1,
                minWidth:40,
                padding: isMobile ? 8 :  "10px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.inputBg,
                color: theme.textPrimary,
                outline: "none",
                fontSize: isMobile ? 12 :  14,
              }}
            />

            {/* <span
              style={{
                fontSize: 13,
                minWidth: 60,
                textAlign: "center",
              }}
            >
              {resultCount === 0
                ? "0/0"
                : `${currentIndex + 1}/${resultCount}`}
            </span> */}
            <span
              style={{
                minWidth: isMobile ? 40 : 52,
                textAlign: "center",
                fontSize:isMobile ? 10 : 13,
                fontWeight: 600,
                color: theme.textSecondary,
                padding: "6px 10px",
                borderRadius: 8,
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
              }}
            >
              {resultCount === 0
                ? "0 / 0"
                : `${currentIndex + 1} / ${resultCount}`}
            </span>

            <button style={{ background: theme.inputBg }} onClick={onPrev}><img src={upIcon} style={{ width: isMobile ? 12 : "20px" }} alt="" /></button>

            <button style={{ background: theme.inputBg }} onClick={onNext}><img src={downIcon} style={{ width: isMobile ? 12 : "20px" }} alt="" /></button>

            <button style={{ background: theme.inputBg }} onClick={onClose}><img src={crossIcon} style={{ width: isMobile ? 12 : "20px" }} alt="" /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;