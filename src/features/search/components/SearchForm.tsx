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
  import { useState, useEffect } from "react";
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
    const [travelersInput, setTravelersInput] = useState<string>(String(travelers));

  useEffect(() => {
    setTravelersInput(String(travelers));
  }, [travelers]);
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
      {/* Trip type tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tripType === "one-way" ? 0 : 1}
          onChange={(_, newValue) => {
            dispatch(setTripType(newValue === 0 ? "one-way" : "round-trip"));
          }}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              px: 2,
            },
          }}
        >
          <Tab label="One-way" />
          <Tab label="Round-trip" />
        </Tabs>
      </Box>

      <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
        {/* Search form fields */}
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
          <Box sx={{ flex: { xs: 1, lg: "1.3 1 0" }, px: { xs: 0, lg: 0.75 }, py: { xs: 0.75, lg: 0 } }}>
            <AirportAutocomplete
              label="From"
              value={origin}
              onChange={(v) => dispatch(setOrigin(v))}
            />
          </Box>

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
              size="small"
              sx={{ 
                width: 32,
                height: 32,
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

          <Box sx={{ flex: { xs: 1, lg: "1.3 1 0" }, px: { xs: 0, lg: 0.75 }, py: { xs: 0.75, lg: 0 } }}>
            <AirportAutocomplete
              label="To"
              value={destination}
              onChange={(v) => dispatch(setDestination(v))}
            />
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flex: { xs: 1, lg: "0.6 1 0" }, px: { xs: 0, lg: 0.75 }, py: { xs: 0.75, lg: 0 } }}>
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
                    // Don't allow selecting dates with no flights
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
                    size: "small",
                    InputLabelProps: { shrink: true },
                    onClick: () => setDepartPickerOpen(true),
                    InputProps: {
                      readOnly: true,
                    },
                    sx: {
                      "& .MuiInputBase-root": {
                        minHeight: { xs: 42, sm: 42 },
                        fontSize: "0.875rem",
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
              <Box sx={{ flex: { xs: 1, lg: "0.6 1 0" }, px: { xs: 0, lg: 0.75 }, py: { xs: 0.75, lg: 0 } }}>
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
                      // Don't allow selecting dates with no flights
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
                      size: "small",
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
                          minHeight: { xs: 42, sm: 42 },
                          fontSize: "0.875rem",
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

          <Box sx={{ flex: { xs: 1, lg: "0.5 1 0" }, px: { xs: 0, lg: 0.75 }, py: { xs: 0.75, lg: 0 } }}>
            <TextField
              type="text"
              label="Travelers"
              value={travelersInput}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === "" || /^\d*$/.test(inputValue)) {
                  setTravelersInput(inputValue);
                }
              }}
              onBlur={(e) => {
                const inputValue = e.target.value.trim();
                if (inputValue === "") {
                  setTravelersInput("1");
                  dispatch(setTravelers(1));
                  return;
                }
                const value = parseInt(inputValue, 10);
                if (!isNaN(value) && value > 0) {
                  dispatch(setTravelers(value));
                } else {
                  setTravelersInput(String(travelers));
                }
              }}
              inputProps={{ 
                inputMode: "numeric",
                pattern: "[0-9]*"
              }}
              size="small"
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: { xs: 42, sm: 42 },
                  borderRadius: 1,
                  fontSize: "0.875rem",
                }
              }}
            />
          </Box>

          <Box sx={{ 
            flex: { xs: 1, lg: "0 0 auto" },
            px: { xs: 0, lg: 0.75 },
            py: { xs: 0.75, lg: 0 }
          }}>
            <Button
              variant="contained"
              fullWidth
              size="medium"
              onClick={handleSearch}
              disabled={!canSearch}
              sx={{
                minHeight: { xs: 42, lg: 42 },
                minWidth: { xs: "auto", lg: 48 },
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
