import {
    Card,
    CardContent,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
  } from "@mui/material";
  import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
  import { useEffect, useRef } from "react";
  import { useAppDispatch, useAppSelector } from "../../../app/hooks";
  import {
    setDepartDate,
    setDestination,
    setOrigin,
    setReturnDate,
    setSort,
    swapRoute,
    submitSearch,
  } from "../searchSlice";
  import AirportAutocomplete from "./AirportAutocomplete";
  
  const AUTO_SEARCH_DEBOUNCE_MS = 350;
  
  export default function SearchForm() {
    const dispatch = useAppDispatch();
    const { origin, destination, departDate, returnDate, sort } = useAppSelector((s) => s.search);
  
    // Don't search automatically when the page first loads
    const didMountRef = useRef(false);
    // Timer for debouncing searches
    const tRef = useRef<number | null>(null);
  
  const canSearch = Boolean(origin && destination && departDate);

  const handleSearch = () => {
    if (canSearch) {
      dispatch(submitSearch());
    }
  };

  useEffect(() => {
    // Skip the first time this runs (when the page loads)
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
  
    // Can't search without all the required fields
    if (!canSearch) return;
  
    // If the user changes multiple fields quickly, wait a bit before searching
    // This way we only search once instead of spamming the server
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => {
      dispatch(submitSearch());
    }, AUTO_SEARCH_DEBOUNCE_MS);
  
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, [origin, destination, departDate, returnDate, canSearch, dispatch]);

  // Let users press Enter to search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSearch) {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <Card variant="outlined" onKeyDown={handleKeyDown}>
      <CardContent>
        <Stack spacing={2}>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Search flights
              </Typography>
  
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  size="small"
                  label="Sort"
                  value={sort}
                  onChange={(e) => dispatch(setSort(e.target.value as any))}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="price">Lowest price</MenuItem>
                  <MenuItem value="duration">Shortest duration</MenuItem>
                  <MenuItem value="bestValue">Best value</MenuItem>
                </TextField>
              </Stack>
            </Stack>
  
            {/* Using Stack instead of Grid to avoid TypeScript issues */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Stack sx={{ flex: 1 }}>
                <AirportAutocomplete
                  label="From"
                  value={origin}
                  onChange={(v) => dispatch(setOrigin(v))}
                />
              </Stack>
  
              <Stack sx={{ alignItems: "center" }}>
                <IconButton
                  aria-label="Swap route"
                  disabled={!origin || !destination}
                  onClick={() => dispatch(swapRoute())}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <SwapHorizIcon />
                </IconButton>
              </Stack>
  
              <Stack sx={{ flex: 1 }}>
                <AirportAutocomplete
                  label="To"
                  value={destination}
                  onChange={(v) => dispatch(setDestination(v))}
                />
              </Stack>
            </Stack>
  
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Departure"
                type="date"
                value={departDate}
                onChange={(e) => dispatch(setDepartDate(e.target.value))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
  
              <TextField
                label="Return (optional)"
                type="date"
                value={returnDate ?? ""}
                onChange={(e) => dispatch(setReturnDate(e.target.value || undefined))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }
  