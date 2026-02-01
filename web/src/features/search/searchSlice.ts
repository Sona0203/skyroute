import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SearchState, StopsFilter } from "./types";

const today = new Date().toISOString().slice(0, 10);

const initialState: SearchState = {
    origin: "",
    destination: "",
    departDate: today,
    returnDate: undefined,
    filters: {
      stops: "any",
      airlines: [],
      priceMin: undefined,
      priceMax: undefined,
    },
    sort: "price",
    submittedQuery: null,
  };
  

const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setOrigin(state, action: PayloadAction<string>) {
      state.origin = action.payload.toUpperCase();
    },
    setDestination(state, action: PayloadAction<string>) {
      state.destination = action.payload.toUpperCase();
    },
    swapRoute(state) {
        const prevOrigin = state.origin;
        state.origin = state.destination;
        state.destination = prevOrigin;
      
        // Optional: if user already searched and wants swap + re-search,
        // we should also swap submittedQuery to keep it consistent.
        if (state.submittedQuery) {
          const qOrigin = state.submittedQuery.origin;
          state.submittedQuery = {
            ...state.submittedQuery,
            origin: state.submittedQuery.destination,
            destination: qOrigin,
          };
        }
    },
    setDepartDate(state, action: PayloadAction<string>) {
      state.departDate = action.payload;
    },
    setReturnDate(state, action: PayloadAction<string | undefined>) {
      state.returnDate = action.payload;
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
          returnDate: state.returnDate,
        };
      },
    clearSubmittedSearch(state) {
        state.submittedQuery = null;
      },      
    },
});

export const {
  setOrigin,
  setDestination,
  swapRoute,
  setDepartDate,
  setReturnDate,
  setStopsFilter,
  toggleAirline,
  setPriceRange,
  clearFilters,
  setSort,
  submitSearch,
  clearSubmittedSearch,
} = slice.actions;

export default slice.reducer;
