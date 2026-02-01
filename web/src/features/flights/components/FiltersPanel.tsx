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
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Filters
          </Typography>
          <Button size="small" onClick={() => dispatch(clearFilters())} disabled={!hasAnyFilter}>
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
              <FormControlLabel value="any" control={<Radio />} label="Any" />
              <FormControlLabel value="0" control={<Radio />} label="Direct" />
              <FormControlLabel value="1" control={<Radio />} label="1 stop" />
              <FormControlLabel value="2+" control={<Radio />} label="2+ stops" />
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
                      <Typography variant="body2">{a.code}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({a.count})
                      </Typography>
                    </Stack>
                  }
                  sx={{ mr: 0 }}
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
  