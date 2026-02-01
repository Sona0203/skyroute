import { useState, useEffect, useRef } from "react";
import { useGetFlightOffersPaginatedQuery } from "../flightsApi";
import type { FlightOffer } from "../types";
import { PAGE_SIZE } from "../../../constants";

export function useInfiniteFlights(
  query: { origin: string; destination: string; departDate: string; returnDate?: string; travelers?: number } | null
) {
  const [page, setPage] = useState(1);
  const queryKeyRef = useRef<string>("");

  // Generate a unique key for this query
  const currentQueryKey = query
    ? `${query.origin}-${query.destination}-${query.departDate}-${query.returnDate || ""}-${query.travelers || 1}`
    : "";

  // Track if query changed to show loading state
  const queryChangedRef = useRef(false);
  const previousQueryKeyRef = useRef<string>("");

  // Reset page when query changes and track the change
  useEffect(() => {
    if (currentQueryKey !== queryKeyRef.current && currentQueryKey !== "") {
      // Query changed - mark it and reset page
      queryChangedRef.current = true;
      previousQueryKeyRef.current = queryKeyRef.current;
      queryKeyRef.current = currentQueryKey;
      setPage(1);
    }
  }, [currentQueryKey]);

  const { data, isLoading, isFetching, error } = useGetFlightOffersPaginatedQuery(
    {
      origin: query?.origin ?? "",
      destination: query?.destination ?? "",
      departDate: query?.departDate ?? "",
      returnDate: query?.returnDate,
      travelers: query?.travelers ?? 1,
      page,
      pageSize: PAGE_SIZE,
    },
    { skip: !query }
  );

  // Reset query changed flag when data arrives
  useEffect(() => {
    if (data && !isFetching && queryChangedRef.current) {
      queryChangedRef.current = false;
    }
  }, [data, isFetching]);

  const loadMore = () => {
    if (data?.hasMore && !isFetching && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  // Show loading when: initial load, query changed and fetching, or fetching first page
  const isInitialLoading = (isLoading || isFetching) && page === 1;
  const showLoading = isInitialLoading || (queryChangedRef.current && (isFetching || isLoading));

  return {
    flights: (data?.flights ?? []) as FlightOffer[],
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading: showLoading,
    isLoadingMore: isFetching && page > 1,
    error,
    loadMore,
  };
}
