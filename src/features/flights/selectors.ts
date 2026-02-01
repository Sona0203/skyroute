import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { ChartPoint, FlightOffer } from "./types";

const EMPTY_FLIGHTS: FlightOffer[] = [];

function getTotalDurationMinutes(f: FlightOffer) {
  return f.legs.reduce((sum, leg) => sum + (leg.durationMinutes ?? 0), 0);
}

function matchesStopsFilter(f: FlightOffer, stops: RootState["search"]["filters"]["stops"]) {
  if (stops === "any") return true;

  if (stops === "0") {
    return f.legs.every((l) => (l.stopsCount ?? 0) === 0);
  }

  if (stops === "1") {
    return f.legs.every((l) => (l.stopsCount ?? 0) === 1);
  }

  return f.legs.every((l) => (l.stopsCount ?? 0) >= 2);
}

function matchesPriceFilter(
  f: FlightOffer,
  priceMin: number | undefined,
  priceMax: number | undefined
) {
  if (priceMin != null && f.priceTotal < priceMin) return false;
  if (priceMax != null && f.priceTotal > priceMax) return false;
  return true;
}

export const makeSelectFilteredFlights = () =>
  createSelector(
    [
      (_: RootState, flights?: FlightOffer[]) => flights ?? EMPTY_FLIGHTS,
      (state: RootState) => state.search.filters.stops,
      (state: RootState) => state.search.filters.airlines,
      (state: RootState) => state.search.filters.priceMin,
      (state: RootState) => state.search.filters.priceMax,
      (state: RootState) => state.search.sort,
    ],
    (flights, stops, airlines, priceMin, priceMax, sort) => {
      let res = flights;

      res = res.filter((f) => matchesPriceFilter(f, priceMin, priceMax));

      res = res.filter((f) => matchesStopsFilter(f, stops));

      // Filter airlines last so counts update properly
      if (airlines.length > 0) {
        res = res.filter((f) => airlines.includes(f.validatingAirline));
      }

      if (sort === "price") {
        res = [...res].sort((a, b) => a.priceTotal - b.priceTotal);
      } else if (sort === "duration") {
        res = [...res].sort((a, b) => getTotalDurationMinutes(a) - getTotalDurationMinutes(b));
      } else if (sort === "bestValue") {
        if (res.length === 0) return res;
        const prices = res.map((f) => f.priceTotal);
        const durations = res.map((f) => getTotalDurationMinutes(f));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        const priceRange = maxPrice - minPrice || 1;
        const durationRange = maxDuration - minDuration || 1;

        res = [...res].sort((a, b) => {
          // Score: 0 = best, 1 = worst (price 60%, duration 40%)
          const scoreA =
            (a.priceTotal - minPrice) / priceRange * 0.6 +
            (getTotalDurationMinutes(a) - minDuration) / durationRange * 0.4;
          const scoreB =
            (b.priceTotal - minPrice) / priceRange * 0.6 +
            (getTotalDurationMinutes(b) - minDuration) / durationRange * 0.4;
          return scoreA - scoreB;
        });
      }

      return res;
    }
  );

export const makeSelectChartSeries = () =>
  createSelector([(_: RootState, filtered: FlightOffer[]) => filtered ?? EMPTY_FLIGHTS], (filtered) => {
    // Group by departure hour, calculate min/median/max prices
    const buckets = new Map<string, number[]>();

    for (const f of filtered) {
      const outbound = f.legs[0];
      const t = (outbound?.departureDateTime ?? "").slice(0, 13) + ":00";
      if (!t || t.length < 5) continue;

      const arr = buckets.get(t) ?? [];
      arr.push(f.priceTotal);
      buckets.set(t, arr);
    }

    const points: ChartPoint[] = Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([t, prices]) => {
        const sorted = [...prices].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        return { t, median, min: sorted[0], max: sorted[sorted.length - 1] };
      });

    return points;
  });

export const makeSelectAvailableAirlines = () =>
  createSelector(
    [
      (_: RootState, flights?: FlightOffer[]) => flights ?? EMPTY_FLIGHTS,
      (state: RootState) => state.search.filters.priceMin,
      (state: RootState) => state.search.filters.priceMax,
      (state: RootState) => state.search.filters.stops,
    ],
    (flights, priceMin, priceMax, stops) => {
      // Only apply price/stops filters so airline counts update dynamically
      const map = new Map<string, number>();

      for (const f of flights) {
        if (!matchesPriceFilter(f, priceMin, priceMax)) continue;
        if (!matchesStopsFilter(f, stops)) continue;

        map.set(f.validatingAirline, (map.get(f.validatingAirline) ?? 0) + 1);
      }

      return Array.from(map.entries())
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => b.count - a.count);
    }
  );

export const makeSelectPriceBounds = () =>
  createSelector(
    [(_: RootState, flights: FlightOffer[] | undefined) => flights ?? EMPTY_FLIGHTS],
    (flights) => {
      if (!flights.length) return { min: 0, max: 0 };

      let min = flights[0].priceTotal;
      let max = flights[0].priceTotal;

      for (const f of flights) {
        if (f.priceTotal < min) min = f.priceTotal;
        if (f.priceTotal > max) max = f.priceTotal;
      }

      return { min: Math.floor(min), max: Math.ceil(max) };
    }
  );
