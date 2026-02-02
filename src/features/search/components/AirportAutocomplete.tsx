import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAirportAutocompleteQuery } from "../../flights/flightsApi";
import type { AirportOption } from "../../flights/types";
import { AIRPORT_AUTOCOMPLETE_DEBOUNCE_MS } from "../../../constants";

type Props = {
  label: string;
  value: string; // The IATA code stored in Redux
  onChange: (iataCode: string) => void;
};

function formatLabel(o: AirportOption) {
  return o.label;
}

export default function AirportAutocomplete({ label, value, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const debounceRef = useRef<number | null>(null);

  const { data: options = [], isLoading: loading } = useAirportAutocompleteQuery(searchQuery, {
    skip: !searchQuery || searchQuery.length < 2,
  });

  const byCode = useMemo(() => {
    const map = new Map<string, AirportOption>();
    for (const o of options) map.set(o.iataCode, o);
    return map;
  }, [options]);

  const selectedOption: AirportOption | null = useMemo(() => {
    if (!value) return null;
    const found = byCode.get(value);
    if (found) return found;

    // Create fallback option if airport was swapped but not in current results
    return { id: value, iataCode: value, label: value };
  }, [value, byCode]);

  const isTypingRef = useRef(false);
  const lastSyncedValueRef = useRef(value);

  // Sync input when Redux value changes (e.g., swapping airports)
  // Don't interrupt if user is actively typing
  useEffect(() => {
    if (value === lastSyncedValueRef.current) return;
    
    // Don't interrupt active typing
    if (isTypingRef.current) {
      lastSyncedValueRef.current = value;
      return;
    }

    lastSyncedValueRef.current = value;
    
    if (!value) {
      setInputValue("");
      return;
    }
    const opt = byCode.get(value);
    setInputValue(opt ? formatLabel(opt) : value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const query = inputValue.trim();
    if (!query || query.length < 2) {
      setSearchQuery("");
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      setSearchQuery(query);
    }, AIRPORT_AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(_, next, reason) => {
        setInputValue(next);

        if (reason === "input") {
          isTypingRef.current = true;
          // Wait a bit before allowing sync again
          setTimeout(() => {
            isTypingRef.current = false;
          }, 500);
        } else if (reason === "reset" || reason === "clear") {
          isTypingRef.current = false;
        }
        // Only search when user types ("input"), not on reset/clear
      }}
      onChange={(_, next) => {
        isTypingRef.current = false;
        if (!next) {
          onChange("");
          return;
        }
        onChange(next.iataCode);
      }}
      getOptionLabel={(opt) => formatLabel(opt)}
      isOptionEqualToValue={(a, b) => a.iataCode === b.iataCode}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiInputBase-root": {
              minHeight: { xs: 42, sm: 42 },
              fontSize: "0.875rem",
            }
          }}
        />
      )}
    />
  );
}
