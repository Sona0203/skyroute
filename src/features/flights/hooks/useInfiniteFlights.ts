import { useState, useEffect, useRef } from "react";
import { useGetFlightOffersPaginatedQuery } from "../flightsApi";
import type { FlightOffer } from "../types";
import { PAGE_SIZE } from "../../../constants";

export function useInfiniteFlights(
  query: { origin: string; destination: string; departDate: string; returnDate?: string; travelers?: number } | null
) {
  const [page, setPage] = useState(1);
  const queryKeyRef = useRef<string>("");

  const currentQueryKey = query
    ? `${query.origin}-${query.destination}-${query.departDate}-${query.returnDate || ""}-${query.travelers || 1}`
    : "";

  const queryChangedRef = useRef(false);
  const previousQueryKeyRef = useRef<string>("");

  useEffect(() => {
    if (currentQueryKey !== queryKeyRef.current && currentQueryKey !== "") {
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
