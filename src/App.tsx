import { Stack } from "@mui/material";
import { useEffect } from "react";
import AppShell from "./components/AppShell";
import SearchForm from "./features/search/components/SearchForm";
import ResultsLayout from "./features/flights/components/ResultsLayout";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import { submitSearch } from "./features/search/searchSlice";

export default function App() {
  const dispatch = useAppDispatch();
  const submittedQuery = useAppSelector((s) => s.search.submittedQuery);
  const { origin, destination, departDate, tripType, returnDate } = useAppSelector((s) => s.search);

  // Auto-submit search on page load if we have valid search params but no submitted query
  useEffect(() => {
    if (!submittedQuery && origin && destination && departDate) {
      // Check if round-trip needs return date
      const canAutoSearch = tripType === "one-way" || (tripType === "round-trip" && returnDate);
      if (canAutoSearch) {
        dispatch(submitSearch());
      }
    }
  }, []); // Only run once on mount

  return (
    <AppShell>
      <Stack spacing={2}>
        <SearchForm />
        {submittedQuery ? <ResultsLayout /> : null}
      </Stack>
    </AppShell>
  );
}
