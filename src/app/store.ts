import { configureStore } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import searchReducer, { saveSearchToStorage } from "../features/search/searchSlice";
import { flightsApi } from "../features/flights/flightsApi";

const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState() as ReturnType<typeof store.getState>;
  saveSearchToStorage(state.search);
  return result;
};

export const store = configureStore({
  reducer: {
    search: searchReducer,
    [flightsApi.reducerPath]: flightsApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(flightsApi.middleware).concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
