import { useMediaQuery, useTheme } from "@mui/material";

// Mobile detection hook
export function useMobile(breakpoint: "sm" | "md" = "md") {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
}

export { useAppDispatch, useAppSelector } from "./store";
