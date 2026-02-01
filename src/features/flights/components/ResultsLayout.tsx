import { Box, Drawer, IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useMemo, useState, useEffect, useRef } from "react";
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
import VirtualizedFlightList from "./VirtualizedFlightList";
import { useInfiniteFlights } from "../hooks/useInfiniteFlights";
import EmptyState from "../../../components/states/EmptyState";
import ErrorState from "../../../components/states/ErrorState";
import ActiveFilters from "./ActiveFilters";
import SkeletonCard from "./SkeletonCard";
import SearchSummaryBar from "./SearchSummaryBar";

type Props = {
  flights: FlightOffer[] | undefined;
  loading: boolean;
  error: boolean;
};

export default function ResultsLayout({ flights: initialFlights, loading: initialLoading, error: initialError }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const submittedQuery = useAppSelector((s) => s.search.submittedQuery);
  
  // Use infinite scroll hook
  const {
    flights: paginatedFlights,
    hasMore,
    isLoading: isLoadingFirstPage,
    isLoadingMore,
    error: paginationError,
    loadMore,
  } = useInfiniteFlights(submittedQuery);

  // Use paginated flights from infinite scroll hook
  const flights = paginatedFlights.length > 0 ? paginatedFlights : (initialFlights ?? []);
  const loading = isLoadingFirstPage || (initialLoading && flights.length === 0);
  const error = paginationError || initialError;

  // Smoothly scroll down to the results when they finish loading
  useEffect(() => {
    if (!loading && flights && flights.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [loading, flights]);

  // Press Escape to close the filters drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && filtersOpen) {
        setFiltersOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [filtersOpen]);

  // Create these selectors once and reuse them (they're memoized)
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

  // Show loading skeletons while we're fetching
  if (loading) {
    return (
      <Box ref={resultsRef}>
        <Stack spacing={1.5}>
          <Stack spacing={1}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </Stack>
        </Stack>
      </Box>
    );
  }

  // Something went wrong
  if (error) {
    return <ErrorState message="Failed to load flights" />;
  }

  // User hasn't searched yet, so don't show anything
  if (!submittedQuery) {
    return null;
  }

  // User searched but we didn't find any flights
  if (!flights || flights.length === 0) {
    return (
      <>
        <SearchSummaryBar flightCount={0} />
        <EmptyState
          title="No flights found"
          subtitle="Try adjusting your search criteria, dates, or destination"
          showSuggestions={true}
        />
      </>
    );
  }

  return (
    <>
      <SearchSummaryBar flightCount={filteredFlights.length} />
      <Box ref={resultsRef}>
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
                top: 140,
                maxHeight: "calc(100vh - 150px)",
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
            <ActiveFilters />
            {chartSeries.length > 0 && <PriceChart series={chartSeries} currency={currency} />}

            {filteredFlights.length > 0 ? (
              <VirtualizedFlightList
                flights={filteredFlights}
                allFlights={filteredFlights}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            ) : (
              <EmptyState
                title="No flights match your filters"
                subtitle="Try adjusting your filter criteria or search dates"
                showSuggestions={true}
              />
            )}
          </Stack>
        </Box>
      </Box>
    </>
  );
}
