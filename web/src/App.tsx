import { Stack } from "@mui/material";
import AppShell from "./components/AppShell";
import SearchForm from "./features/search/components/SearchForm";
import ResultsLayout from "./features/flights/components/ResultsLayout";
import { useAppSelector } from "./app/hooks";

export default function App() {
  const submittedQuery = useAppSelector((s) => s.search.submittedQuery);

  return (
    <AppShell>
      <Stack spacing={2}>
        <SearchForm />
        {submittedQuery ? (
          <ResultsLayout flights={undefined} loading={false} error={false} />
        ) : null}
      </Stack>
    </AppShell>
  );
}
