import {
    Card,
    CardContent,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
    InputAdornment,
  } from "@mui/material";
  import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
  import ClearIcon from "@mui/icons-material/Clear";
  import { useEffect, useRef } from "react";
  import { useAppDispatch, useAppSelector, useMobile } from "../../../app/hooks";
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
  import { AUTO_SEARCH_DEBOUNCE_MS } from "../../../constants";
  
  export default function SearchForm() {
    const dispatch = useAppDispatch();
    const isMobile = useMobile("sm");
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
    <Card variant="outlined" onKeyDown={handleKeyDown} sx={{ mb: { xs: 2, sm: 3 } }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              alignItems={{ xs: "flex-start", sm: "baseline" }} 
              justifyContent="space-between"
              spacing={{ xs: 1.5, sm: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                Search flights
              </Typography>
  
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
                <TextField
                  select
                  size="small"
                  label="Sort"
                  value={sort}
                  onChange={(e) => dispatch(setSort(e.target.value as any))}
                  sx={{ 
                    minWidth: { xs: "100%", sm: 160 },
                    "& .MuiInputBase-root": {
                      minHeight: { xs: 48, sm: 40 }, // Larger touch target on mobile
                    }
                  }}
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
  
              <Stack sx={{ alignItems: "center", justifyContent: "center", minHeight: { xs: 56, md: "auto" } }}>
                <IconButton
                  aria-label="Swap route"
                  disabled={!origin || !destination}
                  onClick={() => dispatch(swapRoute())}
                  sx={{ 
                    border: "1px solid", 
                    borderColor: "divider",
                    width: { xs: 48, sm: 40 },
                    height: { xs: 48, sm: 40 },
                    "&:hover": {
                      bgcolor: "action.hover",
                    }
                  }}
                >
                  <SwapHorizIcon fontSize={isMobile ? "medium" : "small"} />
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
                sx={{
                  "& .MuiInputBase-root": {
                    minHeight: { xs: 56, sm: 48 }, // Larger touch target on mobile
                  }
                }}
              />
  
              <TextField
                label="Return (optional)"
                type="date"
                value={returnDate ?? ""}
                onChange={(e) => dispatch(setReturnDate(e.target.value || undefined))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                InputProps={{
                  endAdornment: returnDate ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear return date"
                        onClick={() => dispatch(setReturnDate(undefined))}
                        edge="end"
                        size="small"
                        sx={{
                          mr: { xs: -1, sm: -0.5 },
                          "&:hover": {
                            bgcolor: "action.hover",
                          }
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                  sx: {
                    minHeight: { xs: 56, sm: 48 }, // Larger touch target on mobile
                  }
                }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }
  