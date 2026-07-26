import {createContext, useContext, useEffect, useState, type ReactNode} from "react";

type ThemeContextValue = {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: "light" | "dark") => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({children}: {children: ReactNode}) {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === "undefined") return false;
        const stored = window.localStorage.getItem("theme");
        if (stored) return stored === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        window.localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    function toggleTheme() {
        setIsDark((prev) => !prev);
    }

    function setTheme(theme: "light" | "dark") {
        setIsDark(theme === "dark");
    }

    return (
        <ThemeContext.Provider value={{isDark, toggleTheme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
}