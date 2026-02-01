import { Stack } from "@mui/material";
import AppShell from "./components/AppShell";
import SearchForm from "./features/search/components/SearchForm";
import ResultsLayout from "./features/flights/components/ResultsLayout";
import { useAppSelector } from "./app/hooks";
import { useGetFlightOffersQuery } from "./features/flights/flightsApi";

export default function App() {
  const submittedQuery = useAppSelector((s) => s.search.submittedQuery);

  const { data, isFetching, isError } = useGetFlightOffersQuery(submittedQuery!, {
    skip: !submittedQuery,
  });

  return (
    <AppShell>
      <Stack spacing={2}>
        <SearchForm />
        {submittedQuery ? (
          <ResultsLayout flights={data} loading={isFetching} error={isError} />
        ) : null}
      </Stack>
    </AppShell>
  );
}
