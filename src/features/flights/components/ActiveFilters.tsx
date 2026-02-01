import { Box, Chip, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  clearFilters,
  setStopsFilter,
  setPriceRange,
  toggleAirline,
} from "../../search/searchSlice";

export default function ActiveFilters() {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((s) => s.search);

  const chips: Array<{ label: string; onDelete: () => void }> = [];

  // Add a chip for the stops filter if it's not set to "any"
  if (filters.stops !== "any") {
    const label = filters.stops === "0" ? "Direct" : filters.stops === "1" ? "1 stop" : "2+ stops";
    chips.push({
      label: `Stops: ${label}`,
      onDelete: () => dispatch(setStopsFilter("any")),
    });
  }

  // Add a chip for price range if the user set one
  if (filters.priceMin != null || filters.priceMax != null) {
    chips.push({
      label: `Price: ${filters.priceMin ?? "min"} - ${filters.priceMax ?? "max"}`,
      onDelete: () => dispatch(setPriceRange({ min: undefined, max: undefined })),
    });
  }

  // Add a chip for each selected airline
  filters.airlines.forEach((code) => {
    chips.push({
      label: `Airline: ${code}`,
      onDelete: () => dispatch(toggleAirline(code)),
    });
  });

  if (chips.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          Active filters:
        </Typography>
        {chips.map((chip, idx) => (
          <Chip
            key={idx}
            size="small"
            label={chip.label}
            onDelete={chip.onDelete}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        ))}
        {chips.length > 1 && (
          <Chip
            size="small"
            label="Clear all"
            onClick={() => dispatch(clearFilters())}
            color="error"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>
    </Box>
  );
}
