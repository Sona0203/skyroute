import { Box, Drawer, IconButton, Stack, TextField, MenuItem } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useMemo, useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, useMobile } from "../../../app/hooks";
import { markDateAsNoFlights, setSort } from "../../search/searchSlice";
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

export default function ResultsLayout() {
  const dispatch = useAppDispatch();
  const isMobile = useMobile("md");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const submittedQuery = useAppSelector((s) => s.search.submittedQuery);
  const sort = useAppSelector((s) => s.search.sort);
  
  const memoizedQuery = useMemo(() => {
    if (!submittedQuery) return null;
    return {
      origin: submittedQuery.origin,
      destination: submittedQuery.destination,
      departDate: submittedQuery.departDate,
      returnDate: submittedQuery.returnDate,
      travelers: submittedQuery.travelers,
    };
  }, [submittedQuery?.origin, submittedQuery?.destination, submittedQuery?.departDate, submittedQuery?.returnDate, submittedQuery?.travelers]);

  const {
    flights,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  } = useInfiniteFlights(memoizedQuery);

  const previousQueryRef = useRef<string>("");
  const currentQueryKey = useMemo(() => {
    if (!submittedQuery) return "";
    return `${submittedQuery.origin}-${submittedQuery.destination}-${submittedQuery.departDate}-${submittedQuery.returnDate || ""}-${submittedQuery.travelers}`;
  }, [submittedQuery]);

  useEffect(() => {
    if (!isLoading && flights && flights.length > 0 && resultsRef.current) {
      // Auto-scroll only on new searches
      const isNewSearch = previousQueryRef.current !== currentQueryKey;
      if (isNewSearch) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
      previousQueryRef.current = currentQueryKey;
    }
  }, [isLoading, flights, currentQueryKey]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && filtersOpen) {
        setFiltersOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [filtersOpen]);

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

  if (isLoading) {
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

  if (error) {
    return <ErrorState message="Failed to load flights" />;
  }

  if (!submittedQuery) {
    return null;
  }

  if (!flights || flights.length === 0) {
    // Mark dates with no flights
    if (submittedQuery.departDate) {
      dispatch(markDateAsNoFlights(submittedQuery.departDate));
    }
    if (submittedQuery.returnDate) {
      dispatch(markDateAsNoFlights(submittedQuery.returnDate));
    }

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
      {/* Chart - positioned right after search summary, before results */}
      {chartSeries.length > 0 && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <PriceChart series={chartSeries} currency={currency} />
        </Box>
      )}

      <Box ref={resultsRef}>
        {/* Mobile: Filters button + bottom drawer */}
        {isMobile && (
          <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: { xs: 1.5, sm: 2 } }}>
              <IconButton
                onClick={() => setFiltersOpen(true)}
                sx={{ 
                  border: "1px solid", 
                  borderColor: "divider",
                  width: { xs: 44, sm: 40 },
                  height: { xs: 44, sm: 40 },
                  "&:hover": {
                    bgcolor: "action.hover",
                  }
                }}
                aria-label="Open filters"
              >
                <FilterListIcon fontSize={isMobile ? "medium" : "small"} />
              </IconButton>
            </Box>

            <Drawer
              anchor="bottom"
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              PaperProps={{
                sx: { 
                  borderTopLeftRadius: { xs: 20, sm: 16 }, 
                  borderTopRightRadius: { xs: 20, sm: 16 }, 
                  maxHeight: "85vh",
                },
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
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {/* Sort select and active filters - in one row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "auto" } }}>
                <ActiveFilters />
              </Box>
              <TextField
                select
                size="medium"
                label="Sort"
                value={sort}
                onChange={(e) => dispatch(setSort(e.target.value as any))}
                sx={{
                  minWidth: { xs: "100%", sm: 160 },
                  "& .MuiInputBase-root": {
                    minHeight: { xs: 56, sm: 56 },
                    borderRadius: 1,
                  }
                }}
              >
                <MenuItem value="price">Lowest price</MenuItem>
                <MenuItem value="duration">Shortest duration</MenuItem>
                <MenuItem value="bestValue">Best value</MenuItem>
              </TextField>
            </Box>

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
