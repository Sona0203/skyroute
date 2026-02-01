import { createTheme } from "@mui/material/styles";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: [
        "Inter",
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Arial",
        "sans-serif",
      ].join(","),
    },
  });

export const lightTheme = getTheme("light");
export const darkTheme = getTheme("dark");
export const theme = lightTheme; // Keep this for backwards compatibility with old code
