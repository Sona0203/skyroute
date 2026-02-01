import { AppBar, Box, Container, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../theme/ThemeContext";

type Props = {
  title?: string;
};

export default function Header({
  title = "SkyRoute",
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode, toggleMode } = useThemeMode();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: { xs: 56, sm: 70 } }}>
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
            <Box
              sx={{
                width: { xs: 36, sm: 38 },
                height: { xs: 36, sm: 38 },
                borderRadius: { xs: 2, sm: 2.5 },
                display: "grid",
                placeItems: "center",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <FlightTakeoffIcon fontSize={isMobile ? "small" : "small"} />
            </Box>
  
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 900, 
                  letterSpacing: -0.4,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" }
                }}
              >
                {title}
              </Typography>
              {!isMobile && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  Fast search • Live filters • Price trends
                </Typography>
              )}
            </Box>
          </Box>
  
          <Box sx={{ flex: 1 }} />
  
          {/* RIGHT */}
          <IconButton
            onClick={toggleMode}
            aria-label="Toggle dark mode"
            size={isMobile ? "medium" : "small"}
            sx={{ 
              border: "1px solid", 
              borderColor: "divider",
              color: "#ffc107",
              width: { xs: 40, sm: 36 },
              height: { xs: 40, sm: 36 },
              "&:hover": {
                color: "#ffb300",
                bgcolor: "action.hover",
              }
            }}
          >
            {mode === "dark" ? (
              <LightModeIcon fontSize={isMobile ? "medium" : "small"} />
            ) : (
              <DarkModeIcon fontSize={isMobile ? "medium" : "small"} />
            )}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
  
}
