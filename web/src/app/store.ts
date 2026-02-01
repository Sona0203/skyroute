import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "../features/search/searchSlice";
import { flightsApi } from "../features/flights/flightsApi";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    [flightsApi.reducerPath]: flightsApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(flightsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
