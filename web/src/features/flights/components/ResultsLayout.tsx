import { Box, Drawer, IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useMemo, useState } from "react";
import { useAppSelector } from "../../../app/hooks";
import type { FlightOffer } from "../types";
import {
  makeSelectAvailableAirlines,
  makeSelectChartSeries,
  makeSelectFilteredFlights,
  makeSelectPriceBounds,
} from "../selectors";
import FiltersPanel from "./FiltersPanel";
import PriceChart from "./PriceChart";
import FlightList from "./FlightList";
import EmptyState from "../../../components/states/EmptyState";
import ErrorState from "../../../components/states/ErrorState";

type Props = {
  flights: FlightOffer[] | undefined;
  loading: boolean;
  error: boolean;
};

export default function ResultsLayout({ flights, loading, error }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const submittedQuery = useAppSelector((s) => s.search.submittedQuery);

  // selector instances (memoized)
  const selectFilteredFlights = useMemo(makeSelectFilteredFlights, []);
  const selectChartSeries = useMemo(makeSelectChartSeries, []);
  const selectAvailableAirlines = useMemo(makeSelectAvailableAirlines, []);
  const selectPriceBounds = useMemo(makeSelectPriceBounds, []);

  const filteredFlights = useAppSelector((s) => selectFilteredFlights(s, flights));
  const chartSeries = useAppSelector((s) => selectChartSeries(s, filteredFlights));
  const availableAirlines = useAppSelector((s) => selectAvailableAirlines(s, flights));
  const priceBounds = useAppSelector((s) => selectPriceBounds(s, flights));

  const currency = filteredFlights[0]?.currency ?? "EUR";

  const filtersContent = (
    <Box sx={{ p: 2 }}>
      <FiltersPanel airlines={availableAirlines} priceBounds={priceBounds} />
    </Box>
  );

  // 1) Loading
  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>Loading…</Box>
      </Stack>
    );
  }

  // 2) Error
  if (error) {
    return <ErrorState message="Failed to load flights" />;
  }

  // 3) Initial state: user hasn't searched yet => show nothing
  if (!submittedQuery) {
    return null;
  }

  // 4) User searched but backend returned no flights
  if (!flights || flights.length === 0) {
    return (
      <EmptyState
        title="No flights found"
        subtitle="Try adjusting your search criteria or dates"
      />
    );
  }

  return (
    <>
      {/* Mobile: Filters button + bottom drawer */}
      {isMobile && (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton
              onClick={() => setFiltersOpen(true)}
              sx={{ border: "1px solid", borderColor: "divider" }}
              aria-label="Open filters"
            >
              <FilterListIcon />
            </IconButton>
          </Box>

          <Drawer
            anchor="bottom"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            PaperProps={{
              sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "80vh" },
            }}
          >
            {filtersContent}
          </Drawer>
        </>
      )}

      {/* Desktop: sidebar + content grid */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: isMobile ? "1fr" : "320px 1fr",
          alignItems: "start",
        }}
      >
        {/* Filters sidebar (desktop only) */}
        {!isMobile && (
          <Box
            sx={{
              position: "sticky",
              top: 80,
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            {filtersContent}
          </Box>
        )}

        {/* Main content */}
        <Stack spacing={3}>
          {chartSeries.length > 0 && <PriceChart series={chartSeries} currency={currency} />}

          {filteredFlights.length > 0 ? (
            <FlightList flights={filteredFlights} />
          ) : (
            <EmptyState
              title="No flights match your filters"
              subtitle="Try adjusting your filter criteria"
            />
          )}
        </Stack>
      </Box>
    </>
  );
}
