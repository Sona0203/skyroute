import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAirportAutocompleteQuery } from "../../flights/flightsApi";
import type { AirportOption } from "../../flights/types";

type Props = {
  label: string;
  value: string; // The IATA code stored in Redux
  onChange: (iataCode: string) => void;
};

const DEBOUNCE_MS = 250;

function formatLabel(o: AirportOption) {
  return o.label;
}

export default function AirportAutocomplete({ label, value, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const debounceRef = useRef<number | null>(null);

  // Use RTK Query for airport autocomplete
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

    // If we swapped airports but they're not in the current options, make a fallback option
    return { id: value, iataCode: value, label: value };
  }, [value, byCode]);

  const isTypingRef = useRef(false);
  const lastSyncedValueRef = useRef(value);

  // Update the input field when the Redux value changes (like when swapping airports)
  // But don't do this if the user is actively typing - we don't want to interrupt them
  useEffect(() => {
    // Skip if nothing actually changed
    if (value === lastSyncedValueRef.current) return;
    
    // If the user is typing right now, don't mess with their input
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
    // We only watch the value, not the options list - otherwise we'd update too often
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Debounce search query updates
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const query = inputValue.trim();
    if (!query || query.length < 2) {
      setSearchQuery("");
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      setSearchQuery(query);
    }, DEBOUNCE_MS);

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
        // Only search for airports when the user is actually typing
        setInputValue(next);

        if (reason === "input") {
          isTypingRef.current = true;
          // Give them a moment to finish typing before we allow syncing again
          setTimeout(() => {
            isTypingRef.current = false;
          }, 500);
        } else if (reason === "reset" || reason === "clear") {
          isTypingRef.current = false;
        }
        // The reason tells us why the input changed:
        // "input" = user typed something
        // "reset" = value changed from outside (like swapping airports)
        // "clear" = user cleared the field
        // We only want to search when it's "input"
      }}
      onChange={(_, next) => {
        // User picked an option, so they're done typing
        isTypingRef.current = false;
        if (!next) {
          onChange("");
          return;
        }
        onChange(next.iataCode);
      }}
      getOptionLabel={(opt) => formatLabel(opt)}
      isOptionEqualToValue={(a, b) => a.iataCode === b.iataCode}
      filterOptions={(x) => x} // Don't re-sort, keep the order the server gave us
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
