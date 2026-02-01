import { useMediaQuery, useTheme } from "@mui/material";

// Custom hook for mobile detection - use this instead of repeating useMediaQuery everywhere
export function useMobile(breakpoint: "sm" | "md" = "md") {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
}

// Re-export Redux hooks
export { useAppDispatch, useAppSelector } from "./store";
