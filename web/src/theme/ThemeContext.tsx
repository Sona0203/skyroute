import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeContextProvider");
  }
  return context;
}

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem("skyroute_theme");
      if (stored === "dark" || stored === "light") {
        return stored;
      }
      // Check if the user's system prefers dark mode
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch {
      // If something goes wrong, just use light mode
    }
    return "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem("skyroute_theme", mode);
    } catch {
      // If localStorage isn't available, that's okay
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
