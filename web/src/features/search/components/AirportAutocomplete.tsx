import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

type AirportOption = {
  id: string;
  iataCode: string;
  name: string;
  cityName?: string;
  countryCode?: string;
  type?: string;
};

type Props = {
  label: string;
  value: string; // The IATA code stored in Redux
  onChange: (iataCode: string) => void;
};

const DEBOUNCE_MS = 250;

function formatLabel(o: AirportOption) {
  const primary = o.iataCode ? `${o.iataCode}` : "";
  const secondaryParts = [o.cityName, o.name, o.countryCode].filter(Boolean);
  const secondary = secondaryParts.length ? ` — ${secondaryParts.join(", ")}` : "";
  return `${primary}${secondary}`;
}

export default function AirportAutocomplete({ label, value, onChange }: Props) {
  const [options, setOptions] = useState<AirportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const debounceRef = useRef<number | null>(null);
  const lastRequestIdRef = useRef(0);

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
    return { id: value, iataCode: value, name: value, type: "AIRPORT" };
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

  // Make sure we clean up any pending search requests when the component unmounts
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchOptions = (q: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const query = q.trim();
    if (!query) {
      setOptions([]);
      return;
    }

    const requestId = ++lastRequestIdRef.current;

    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);

        const resp = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/airports?q=${encodeURIComponent(query)}`
        );
        const json = await resp.json();

        // If a newer request already finished, ignore this old one
        if (requestId !== lastRequestIdRef.current) return;

        const data = Array.isArray(json?.data) ? json.data : [];
        setOptions(
          data.map((x: any) => ({
            id: String(x.id ?? x.iataCode ?? ""),
            iataCode: String(x.iataCode ?? ""),
            name: String(x.name ?? ""),
            cityName: String(x.cityName ?? ""),
            countryCode: String(x.countryCode ?? ""),
            type: String(x.type ?? ""),
          }))
        );
      } catch {
        if (requestId !== lastRequestIdRef.current) return;
        setOptions([]);
      } finally {
        if (requestId === lastRequestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);
  };

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
          fetchOptions(next);
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
