import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SearchState, StopsFilter, TripType } from "./types";

const today = new Date().toISOString().slice(0, 10);

// Restore last search from localStorage
const loadFromStorage = (): Partial<SearchState> => {
  try {
    const stored = localStorage.getItem("skyroute_search");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only restore if dates are still valid
      if (parsed.departDate && parsed.departDate >= today) {
        return parsed;
      }
    }
  } catch {
    // If something goes wrong, start fresh
  }
  return {};
};

const stored = loadFromStorage();

const initialState: SearchState = {
    origin: stored.origin ?? "",
    destination: stored.destination ?? "",
    departDate: stored.departDate ?? today,
    returnDate: stored.returnDate,
    tripType: stored.tripType ?? "one-way",
    travelers: stored.travelers ?? 1,
    filters: {
      stops: stored.filters?.stops ?? "any",
      airlines: stored.filters?.airlines ?? [],
      priceMin: stored.filters?.priceMin,
      priceMax: stored.filters?.priceMax,
    },
    sort: stored.sort ?? "price",
    submittedQuery: null,
    datesWithNoFlights: stored.datesWithNoFlights ?? [],
  };
  

const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setOrigin(state, action: PayloadAction<string>) {
      state.origin = action.payload.toUpperCase();
      // Different route means different availability
      state.datesWithNoFlights = [];
    },
    setDestination(state, action: PayloadAction<string>) {
      state.destination = action.payload.toUpperCase();
      // Different route means different availability
      state.datesWithNoFlights = [];
    },
    swapRoute(state) {
        const prevOrigin = state.origin;
        state.origin = state.destination;
        state.destination = prevOrigin;
      
        // Keep search query in sync when swapping
        if (state.submittedQuery) {
          const qOrigin = state.submittedQuery.origin;
          state.submittedQuery = {
            ...state.submittedQuery,
            origin: state.submittedQuery.destination,
            destination: qOrigin,
          };
        }
        // Different route means different availability
        state.datesWithNoFlights = [];
    },
    setDepartDate(state, action: PayloadAction<string>) {
      state.departDate = action.payload;
    },
    setReturnDate(state, action: PayloadAction<string | undefined>) {
      state.returnDate = action.payload;
      // Clearing return date switches to one-way
      if (!action.payload) {
        state.tripType = "one-way";
      }
    },
    setTripType(state, action: PayloadAction<TripType>) {
      state.tripType = action.payload;
      if (action.payload === "one-way") {
        state.returnDate = undefined;
      }
    },
    setTravelers(state, action: PayloadAction<number>) {
      state.travelers = Math.max(1, Math.min(30, action.payload));
    },

    setStopsFilter(state, action: PayloadAction<StopsFilter>) {
      state.filters.stops = action.payload;
    },
    toggleAirline(state, action: PayloadAction<string>) {
      const code = action.payload.toUpperCase();
      const idx = state.filters.airlines.indexOf(code);
      if (idx >= 0) state.filters.airlines.splice(idx, 1);
      else state.filters.airlines.push(code);
    },
    setPriceRange(state, action: PayloadAction<{ min?: number; max?: number }>) {
      state.filters.priceMin = action.payload.min;
      state.filters.priceMax = action.payload.max;
    },
    clearFilters(state) {
      state.filters = {
        stops: "any",
        airlines: [],
        priceMin: undefined,
        priceMax: undefined,
      };
    },
    setSort(state, action: PayloadAction<SearchState["sort"]>) {
      state.sort = action.payload;
    },
    submitSearch(state) {
        if (!state.origin || !state.destination || !state.departDate) return;
      
        state.submittedQuery = {
          origin: state.origin,
          destination: state.destination,
          departDate: state.departDate,
          returnDate: state.tripType === "round-trip" ? state.returnDate : undefined,
          travelers: state.travelers,
        };
      },
    clearSubmittedSearch(state) {
        state.submittedQuery = null;
      },
    markDateAsNoFlights(state, action: PayloadAction<string>) {
      // Mark date as having no flights (YYYY-MM-DD format)
      if (!state.datesWithNoFlights.includes(action.payload)) {
        state.datesWithNoFlights.push(action.payload);
      }
    },
    },
});

// Save search to localStorage for later restoration
export const saveSearchToStorage = (state: SearchState) => {
  try {
    const toSave = {
      origin: state.origin,
      destination: state.destination,
      departDate: state.departDate,
      returnDate: state.returnDate,
      tripType: state.tripType,
      travelers: state.travelers,
      filters: state.filters,
      sort: state.sort,
      datesWithNoFlights: state.datesWithNoFlights,
    };
    localStorage.setItem("skyroute_search", JSON.stringify(toSave));
  } catch {
    // If localStorage fails, continue anyway
  }
};

export const {
  setOrigin,
  setDestination,
  swapRoute,
  setDepartDate,
  setReturnDate,
  setTripType,
  setTravelers,
  setStopsFilter,
  toggleAirline,
  setPriceRange,
  clearFilters,
  setSort,
  submitSearch,
  clearSubmittedSearch,
  markDateAsNoFlights,
} = slice.actions;

export default slice.reducer;
