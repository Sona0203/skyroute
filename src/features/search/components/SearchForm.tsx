import {
    Box,
    Card,
    CardContent,
    IconButton,
    Stack,
    InputAdornment,
    Tabs,
    Tab,
    Button,
    TextField,
    useTheme,
    alpha,
  } from "@mui/material";
  import { DatePicker } from "@mui/x-date-pickers/DatePicker";
  import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
  import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
  import { useState } from "react";
  import { parseISO, isValid, format } from "date-fns";
  import { useAppDispatch, useAppSelector } from "../../../app/hooks";
  import {
    setDepartDate,
    setDestination,
    setOrigin,
    setReturnDate,
    setTripType,
    setTravelers,
    swapRoute,
    submitSearch,
  } from "../searchSlice";
  import AirportAutocomplete from "./AirportAutocomplete";
  
  export default function SearchForm() {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { origin, destination, departDate, returnDate, tripType, travelers, datesWithNoFlights } = useAppSelector((s) => s.search);
    const [departPickerOpen, setDepartPickerOpen] = useState(false);
    const [returnPickerOpen, setReturnPickerOpen] = useState(false);

  // For round-trip, return date is required
  const canSearch = Boolean(
    origin && 
    destination && 
    departDate && 
    (tripType === "one-way" || (tripType === "round-trip" && returnDate))
  );

  const handleSearch = () => {
    if (canSearch) {
      dispatch(submitSearch());
    }
  };

  // Let users press Enter to search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSearch) {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <Card 
      variant="outlined" 
      onKeyDown={handleKeyDown} 
      sx={{ 
        mb: { xs: 2, sm: 2 },
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.12)}`,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {/* Trip type tabs - Kayak style */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tripType === "one-way" ? 0 : 1}
          onChange={(_, newValue) => {
            dispatch(setTripType(newValue === 0 ? "one-way" : "round-trip"));
          }}
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "none",
              fontSize: "0.9375rem",
              fontWeight: 500,
              px: 3,
            },
          }}
        >
          <Tab label="One-way" />
          <Tab label="Round-trip" />
        </Tabs>
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Single line search form - horizontal on desktop */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={0}
          alignItems={{ xs: "stretch", lg: "stretch" }}
          sx={{
            "& > *:not(:last-child)": {
              borderRight: { lg: `1px solid ${theme.palette.divider}` },
            }
          }}
        >
          {/* From */}
          <Box sx={{ flex: { xs: 1, lg: "1.3 1 0" }, px: { xs: 0, lg: 1 }, py: { xs: 1, lg: 0 } }}>
            <AirportAutocomplete
              label="From"
              value={origin}
              onChange={(v) => dispatch(setOrigin(v))}
            />
          </Box>

          {/* Swap button - vertical divider style */}
          <Box 
            sx={{ 
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              justifyContent: "center",
              px: 0.5,
            }}
          >
            <IconButton
              aria-label="Swap route"
              disabled={!origin || !destination}
              onClick={() => dispatch(swapRoute())}
              sx={{ 
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: alpha(theme.palette.action.hover, 0.5),
                },
                "&:disabled": {
                  opacity: 0.3,
                }
              }}
            >
              <SwapHorizIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* To */}
          <Box sx={{ flex: { xs: 1, lg: "1.3 1 0" }, px: { xs: 0, lg: 1 }, py: { xs: 1, lg: 0 } }}>
            <AirportAutocomplete
              label="To"
              value={destination}
              onChange={(v) => dispatch(setDestination(v))}
            />
          </Box>

          {/* Dates */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flex: { xs: 1, lg: "0.6 1 0" }, px: { xs: 0, lg: 1 }, py: { xs: 1, lg: 0 } }}>
              <DatePicker
                label="Departure"
                format="dd/MM/yyyy"
                open={departPickerOpen}
                onOpen={() => setDepartPickerOpen(true)}
                onClose={() => setDepartPickerOpen(false)}
                value={departDate ? parseISO(departDate + "T00:00:00") : null}
                onChange={(newValue) => {
                  if (newValue && isValid(newValue)) {
                    const dateStr = format(newValue, "yyyy-MM-dd");
                    // Prevent selecting disabled dates
                    if (!datesWithNoFlights.includes(dateStr)) {
                      dispatch(setDepartDate(dateStr));
                      setDepartPickerOpen(false);
                    }
                  }
                }}
                shouldDisableDate={(date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  return datesWithNoFlights.includes(dateStr);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "medium",
                    InputLabelProps: { shrink: true },
                    onClick: () => setDepartPickerOpen(true),
                    InputProps: {
                      readOnly: true,
                    },
                    sx: {
                      "& .MuiInputBase-root": {
                        minHeight: { xs: 56, sm: 56 },
                        cursor: "pointer",
                        borderRadius: 1,
                      },
                      "& input": {
                        cursor: "pointer",
                      }
                    }
                  },
                }}
              />
            </Box>
  
            {tripType === "round-trip" && (
              <Box sx={{ flex: { xs: 1, lg: "0.6 1 0" }, px: { xs: 0, lg: 1 }, py: { xs: 1, lg: 0 } }}>
                <DatePicker
                  label="Return"
                  format="dd/MM/yyyy"
                  open={returnPickerOpen}
                  onOpen={() => setReturnPickerOpen(true)}
                  onClose={() => setReturnPickerOpen(false)}
                  value={returnDate ? parseISO(returnDate + "T00:00:00") : null}
                  onChange={(newValue) => {
                    if (newValue && isValid(newValue)) {
                      const dateStr = format(newValue, "yyyy-MM-dd");
                      // Prevent selecting disabled dates
                      if (!datesWithNoFlights.includes(dateStr)) {
                        dispatch(setReturnDate(dateStr));
                        setReturnPickerOpen(false);
                      }
                    } else {
                      dispatch(setReturnDate(undefined));
                    }
                  }}
                  shouldDisableDate={(date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return datesWithNoFlights.includes(dateStr);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "medium",
                      InputLabelProps: { shrink: true },
                      onClick: () => setReturnPickerOpen(true),
                      InputProps: {
                        readOnly: true,
                        endAdornment: returnDate ? (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="Clear return date"
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(setReturnDate(undefined));
                              }}
                              edge="end"
                              size="small"
                              sx={{
                                mr: -0.5,
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.action.hover, 0.5),
                                }
                              }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : undefined,
                      },
                      sx: {
                        "& .MuiInputBase-root": {
                          minHeight: { xs: 56, sm: 56 },
                          cursor: "pointer",
                          borderRadius: 1,
                        },
                        "& input": {
                          cursor: "pointer",
                        }
                      },
                      required: tripType === "round-trip",
                    },
                  }}
                />
              </Box>
            )}
          </LocalizationProvider>

          {/* Travelers */}
          <Box sx={{ flex: { xs: 1, lg: "0.5 1 0" }, px: { xs: 0, lg: 1 }, py: { xs: 1, lg: 0 } }}>
            <TextField
              type="number"
              label="Travelers"
              value={travelers}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 9) {
                  dispatch(setTravelers(value));
                }
              }}
              inputProps={{ min: 1, max: 9 }}
              size="medium"
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: { xs: 56, sm: 56 },
                  borderRadius: 1,
                }
              }}
            />
          </Box>

          {/* Search Button - Kayak style orange/red */}
          <Box sx={{ 
            flex: { xs: 1, lg: "0 0 auto" },
            px: { xs: 0, lg: 1 },
            py: { xs: 1, lg: 0 }
          }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSearch}
              disabled={!canSearch}
              sx={{
                minHeight: { xs: 56, lg: 56 },
                minWidth: { xs: "auto", lg: 56 },
                borderRadius: 1,
                bgcolor: canSearch ? "#ff5a5f" : undefined,
                color: canSearch ? "#ffffff" : undefined,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: canSearch ? "#ff4a50" : undefined,
                  boxShadow: "none",
                },
                "&:disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <SearchIcon />
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
