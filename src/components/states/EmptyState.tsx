import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearFilters } from "../../features/search/searchSlice";

export default function EmptyState({ 
  title, 
  subtitle,
  showSuggestions = false 
}: { 
  title: string; 
  subtitle?: string;
  showSuggestions?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((s) => s.search);

  const hasFilters = filters.stops !== "any" || filters.airlines.length > 0 || 
                     filters.priceMin != null || filters.priceMax != null;

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
        {showSuggestions && hasFilters && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Try these suggestions:
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                onClick={() => dispatch(clearFilters())}
              >
                Clear all filters
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => dispatch(clearFilters())}
              >
                Adjust date range
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
