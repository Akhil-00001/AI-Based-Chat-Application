import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { lightTheme, darkTheme } from "../theme/theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem("chat-theme");

        if (savedTheme === "dark") return true;
        if (savedTheme === "light") return false;

        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    const theme = useMemo(() => {
        return isDark ? darkTheme : lightTheme;
    }, [isDark]);

    useEffect(() => {
        localStorage.setItem("chat-theme", isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return useContext(ThemeContext);
};