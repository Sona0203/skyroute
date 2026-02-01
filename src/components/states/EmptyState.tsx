import { Box, Paper, Stack, Typography } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

export default function EmptyState({ 
  title, 
  subtitle,
}: { 
  title: string; 
  subtitle?: string;
  showSuggestions?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <FlightTakeoffIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
