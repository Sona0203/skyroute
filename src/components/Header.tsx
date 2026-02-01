import { AppBar, Box, Container, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../theme/ThemeContext";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function Header({
  title = "SkyRoute",
  subtitle = "Find the best flights for your next trip",
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
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: { xs: 60, sm: 70 } }}>
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <FlightTakeoffIcon fontSize="small" />
            </Box>
  
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
                {title}
              </Typography>
              {!isMobile && (
                <Typography variant="caption" color="text.secondary">
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
            size="small"
            sx={{ 
              border: "1px solid", 
              borderColor: "divider",
              color: "#ffc107",
              "&:hover": {
                color: "#ffb300",
              }
            }}
          >
            {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
  
}
