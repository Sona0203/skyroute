import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { ChartPoint, FlightOffer } from "./types";

function getTotalDurationMinutes(f: FlightOffer) {
  // works for one-way (1 leg) and round-trip (2 legs)
  return f.legs.reduce((sum, leg) => sum + (leg.durationMinutes ?? 0), 0);
}

function matchesStopsFilter(f: FlightOffer, stops: RootState["search"]["filters"]["stops"]) {
  // StopsFilter should be: "any" | "0" | "1" | "2+"
  if (stops === "any") return true;

  if (stops === "0") {
    // direct only: every leg must be direct
    return f.legs.every((l) => (l.stopsCount ?? 0) === 0);
  }

  if (stops === "1") {
    // exactly 1 stop for every leg
    return f.legs.every((l) => (l.stopsCount ?? 0) === 1);
  }

  // "2+"
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
      (state: RootState, flights?: FlightOffer[]) => flights ?? [],
      (state: RootState) => state.search.filters,
      (state: RootState) => state.search.sort,
    ],
    (flights, filters, sort) => {
      let res = flights;

      // Price
      res = res.filter((f) => matchesPriceFilter(f, filters.priceMin, filters.priceMax));

      // Stops
      res = res.filter((f) => matchesStopsFilter(f, filters.stops));

      // Airlines (LAST)
      if (filters.airlines.length > 0) {
        res = res.filter((f) => filters.airlines.includes(f.validatingAirline));
      }

      // Sort
      if (sort === "price") {
        res = [...res].sort((a, b) => a.priceTotal - b.priceTotal);
      } else if (sort === "duration") {
        res = [...res].sort((a, b) => getTotalDurationMinutes(a) - getTotalDurationMinutes(b));
      }

      return res;
    }
  );

export const makeSelectChartSeries = () =>
  createSelector([(_s: RootState, filtered: FlightOffer[]) => filtered], (filtered) => {
    // bucket by outbound departure hour; compute min/median/max
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
      (state: RootState, flights?: FlightOffer[]) => flights ?? [],
      (state: RootState) => state.search.filters.priceMin,
      (state: RootState) => state.search.filters.priceMax,
      (state: RootState) => state.search.filters.stops,
    ],
    (flights, priceMin, priceMax, stops) => {
      // IMPORTANT: apply price+stops, but NOT selected airlines,
      // so counts update when price/stops changes.
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
    [(state: RootState, flights: FlightOffer[] | undefined) => flights ?? []],
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
