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
  value: string; // IATA code in Redux
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

    // fallback so swapped values stay visible even if not in options
    return { id: value, iataCode: value, name: value, type: "AIRPORT" };
  }, [value, byCode]);

  // Sync displayed input text when Redux value changes (swap / selection)
  useEffect(() => {
    if (!value) {
      setInputValue("");
      return;
    }
    const opt = byCode.get(value);
    setInputValue(opt ? formatLabel(opt) : value);
  }, [value, byCode]);

  // Cleanup pending debounce on unmount
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

        // ignore out-of-order responses
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
        // ✅ IMPORTANT: only fetch when user types
        setInputValue(next);

        if (reason === "input") {
          fetchOptions(next);
        }
        // reason can be: "reset" | "clear" | "input"
        // "reset" happens when value changes (swap/select) — DO NOT fetch then
      }}
      onChange={(_, next) => {
        if (!next) {
          onChange("");
          return;
        }
        onChange(next.iataCode);
      }}
      getOptionLabel={(opt) => formatLabel(opt)}
      isOptionEqualToValue={(a, b) => a.iataCode === b.iataCode}
      filterOptions={(x) => x} // keep server order
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
