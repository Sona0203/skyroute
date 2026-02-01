import {
    Box,
    Button,
    Chip,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    Radio,
    RadioGroup,
    Slider,
    Stack,
    Typography,
  } from "@mui/material";
  import { useMemo } from "react";
  import { useAppDispatch, useAppSelector } from "../../../app/hooks";
  import {
    clearFilters,
    setPriceRange,
    setStopsFilter,
    toggleAirline,
  } from "../../search/searchSlice";
  
  export default function FiltersPanel({
    airlines,
    priceBounds,
  }: {
    airlines: Array<{ code: string; count: number }>;
    priceBounds: { min: number; max: number };
  }) {
    const dispatch = useAppDispatch();
    const { filters } = useAppSelector((s) => s.search);
  
    const sliderMin = priceBounds.min;
    const sliderMax = priceBounds.max;
  
    const sliderValue = useMemo(() => {
      const min = filters.priceMin ?? sliderMin;
      const max = filters.priceMax ?? sliderMax;
      return [min, max] as number[];
    }, [filters.priceMin, filters.priceMax, sliderMin, sliderMax]);
  
    const hasAnyFilter =
      filters.stops !== "any" ||
      filters.airlines.length > 0 ||
      filters.priceMin != null ||
      filters.priceMax != null;
  
    return (
      <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", sm: "1rem" } }}>
            Filters
          </Typography>
          <Button 
            size="small" 
            onClick={() => dispatch(clearFilters())} 
            disabled={!hasAnyFilter}
            sx={{
              minHeight: { xs: 40, sm: 32 },
              px: { xs: 2, sm: 1.5 },
            }}
          >
            Clear
          </Button>
        </Stack>
  
        {/* Stops */}
        <Box>
          <Typography variant="overline" color="text.secondary">
            Stops
          </Typography>
          <FormControl fullWidth>
            <RadioGroup
              value={filters.stops}
              onChange={(e) => {
                // These are the valid values: "any", "0", "1", or "2+"
                dispatch(setStopsFilter(e.target.value as any));
              }}
            >
              <FormControlLabel 
                value="any" 
                control={<Radio />} 
                label="Any"
                sx={{ 
                  "& .MuiFormControlLabel-label": { 
                    fontSize: { xs: "0.9rem", sm: "0.875rem" } 
                  },
                  minHeight: { xs: 48, sm: 40 },
                }}
              />
              <FormControlLabel 
                value="0" 
                control={<Radio />} 
                label="Direct"
                sx={{ 
                  "& .MuiFormControlLabel-label": { 
                    fontSize: { xs: "0.9rem", sm: "0.875rem" } 
                  },
                  minHeight: { xs: 48, sm: 40 },
                }}
              />
              <FormControlLabel 
                value="1" 
                control={<Radio />} 
                label="1 stop"
                sx={{ 
                  "& .MuiFormControlLabel-label": { 
                    fontSize: { xs: "0.9rem", sm: "0.875rem" } 
                  },
                  minHeight: { xs: 48, sm: 40 },
                }}
              />
              <FormControlLabel 
                value="2+" 
                control={<Radio />} 
                label="2+ stops"
                sx={{ 
                  "& .MuiFormControlLabel-label": { 
                    fontSize: { xs: "0.9rem", sm: "0.875rem" } 
                  },
                  minHeight: { xs: 48, sm: 40 },
                }}
              />
            </RadioGroup>
          </FormControl>
        </Box>
  
        <Divider />
  
        {/* Price */}
        <Box>
          <Typography variant="overline" color="text.secondary">
            Price range
          </Typography>
          <Slider
            value={sliderValue}
            min={sliderMin}
            max={sliderMax}
            valueLabelDisplay="auto"
            disableSwap
            onChange={(_, v) => {
              const [min, max] = v as number[];
              dispatch(setPriceRange({ min, max }));
            }}
            sx={{
              "& .MuiSlider-thumb": {
                width: { xs: 20, sm: 16 },
                height: { xs: 20, sm: 16 },
              },
              "& .MuiSlider-track": {
                height: { xs: 4, sm: 3 },
              },
              "& .MuiSlider-rail": {
                height: { xs: 4, sm: 3 },
              },
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {(filters.priceMin != null || filters.priceMax != null) && (
              <Chip
                size="small"
                label={`${filters.priceMin ?? sliderMin} – ${filters.priceMax ?? sliderMax}`}
                onDelete={() => dispatch(setPriceRange({ min: undefined, max: undefined }))}
              />
            )}
          </Stack>
        </Box>
  
        <Divider />
  
        {/* Airlines - users can select multiple */}
        <Box>
          <Typography variant="overline" color="text.secondary">
            Airlines
          </Typography>
  
          <FormGroup>
            {airlines.slice(0, 12).map((a) => {
              const checked = filters.airlines.includes(a.code);
              const disabled = a.count === 0;
  
              return (
                <FormControlLabel
                  key={a.code}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => dispatch(toggleAirline(a.code))}
                    />
                  }
                  label={
                    <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>
                        {a.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.9rem", sm: "0.875rem" } }}>
                        ({a.count})
                      </Typography>
                    </Stack>
                  }
                  sx={{ 
                    mr: 0,
                    minHeight: { xs: 48, sm: 40 },
                    "& .MuiCheckbox-root": {
                      padding: { xs: "12px", sm: "9px" },
                    }
                  }}
                />
              );
            })}
          </FormGroup>
  
          {filters.airlines.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {filters.airlines.map((code) => (
                <Chip
                  key={code}
                  size="small"
                  label={code}
                  onDelete={() => dispatch(toggleAirline(code))}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    );
  }
  