import { useState, useEffect, useRef } from "react";
import { useGetFlightOffersPaginatedQuery } from "../flightsApi";
import type { FlightOffer } from "../types";

const PAGE_SIZE = 10;

export function useInfiniteFlights(
  query: { origin: string; destination: string; departDate: string; returnDate?: string } | null
) {
  const [page, setPage] = useState(1);
  const queryKeyRef = useRef<string>("");

  // Generate a unique key for this query
  const currentQueryKey = query
    ? `${query.origin}-${query.destination}-${query.departDate}-${query.returnDate || ""}`
    : "";

  // Reset page when query changes
  useEffect(() => {
    if (currentQueryKey !== queryKeyRef.current) {
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
      page,
      pageSize: PAGE_SIZE,
    },
    { skip: !query }
  );

  const loadMore = () => {
    if (data?.hasMore && !isFetching && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  return {
    flights: (data?.flights ?? []) as FlightOffer[],
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading: isLoading && page === 1,
    isLoadingMore: isFetching && page > 1,
    error,
    loadMore,
  };
}
