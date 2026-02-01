import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AirportOption, FlightOffer } from "./types";
import { airportAutocomplete as amadeusAirportAutocomplete, flightOffersSearch as amadeusFlightOffersSearch } from "../../services/amadeus";

type AirportRaw = {
  id: string;
  iataCode?: string;
  name?: string;
  cityName?: string;
  countryCode?: string;
  subType?: string;
};

function toAirportOption(x: AirportRaw): AirportOption | null {
  const code = (x.iataCode || "").trim().toUpperCase();
  if (!code) return null;
  const name = (x.cityName || x.name || "").trim();
  const country = (x.countryCode || "").trim();
  const label = `${code} — ${[name, country].filter(Boolean).join(", ")}`;
  return { id: x.id, iataCode: code, label };
}

// Parse the duration format from Amadeus API (like "PT2H35M" means 2 hours 35 minutes)
function parseDurationMinutes(pt: string): number {
    const h = /(\d+)H/.exec(pt)?.[1];
    const m = /(\d+)M/.exec(pt)?.[1];
    return (h ? Number(h) * 60 : 0) + (m ? Number(m) : 0);
}
  
  function normalizeOffer(raw: any): FlightOffer {
    const id = String(raw.id ?? "");
    const currency = String(raw.price?.currency ?? "EUR");
    const priceTotal = Number(raw.price?.total ?? 0);
  
    const validatingAirline =
      String(raw.validatingAirlineCodes?.[0] ?? raw.validatingAirlineCode ?? "—");
  
    const itineraries = Array.isArray(raw.itineraries) ? raw.itineraries : [];
  
    const legs = itineraries
      .slice(0, 2) // Just get the outbound and return flights
      .map((it: any) => {
        const segmentsRaw = it?.segments ?? [];
        const stopsCount = Math.max(0, segmentsRaw.length - 1);
  
        const firstSeg = segmentsRaw[0];
        const lastSeg = segmentsRaw[segmentsRaw.length - 1];
  
        const departureDateTime = String(firstSeg?.departure?.at ?? "");
        const arrivalDateTime = String(lastSeg?.arrival?.at ?? "");
  
        const durationMinutes = parseDurationMinutes(String(it?.duration ?? "PT0M"));
  
        const segments = segmentsRaw.map((s: any) => ({
          from: String(s.departure?.iataCode ?? ""),
          to: String(s.arrival?.iataCode ?? ""),
          departAt: String(s.departure?.at ?? ""),
          arriveAt: String(s.arrival?.at ?? ""),
          carrier: String(s.carrierCode ?? ""),
          flightNumber: String(s.number ?? ""),
        }));
  
        return {
          stopsCount,
          departureDateTime,
          arrivalDateTime,
          durationMinutes,
          segments,
        };
      });
  
    return {
      id,
      priceTotal,
      currency,
      validatingAirline,
      legs,
    };
  }
  

export const flightsApi = createApi({
  reducerPath: "flightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/", // Not used since we're calling Amadeus directly
  }),
  endpoints: (builder) => ({
    airportAutocomplete: builder.query<AirportOption[], string>({
      queryFn: async (q) => {
        try {
          const data = await amadeusAirportAutocomplete(q);
          const out: AirportOption[] = [];
          for (const item of data) {
            const opt = toAirportOption(item);
            if (opt) out.push(opt);
          }
          // Remove duplicates - if we have multiple airports with the same code, just keep one
          const seen = new Set<string>();
          const unique = out.filter((o) => {
            if (seen.has(o.iataCode)) return false;
            seen.add(o.iataCode);
            return true;
          });
          return { data: unique };
        } catch (error: any) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
      },
      keepUnusedDataFor: 60,
    }),

    getFlightOffers: builder.query<
      FlightOffer[],
      { origin: string; destination: string; departDate: string; returnDate?: string }
    >({
      queryFn: async (p) => {
        try {
          const raw = await amadeusFlightOffersSearch({
            origin: p.origin,
            destination: p.destination,
            departDate: p.departDate,
            returnDate: p.returnDate,
            adults: 1,
            max: 50,
            currencyCode: "EUR",
          });
          const flights = raw.map(normalizeOffer);
          return { data: flights };
        } catch (error: any) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
      },
      keepUnusedDataFor: 30,
    }),

    getFlightOffersPaginated: builder.query<
      { flights: FlightOffer[]; total: number; hasMore: boolean },
      { 
        origin: string; 
        destination: string; 
        departDate: string; 
        returnDate?: string;
        page: number;
        pageSize: number;
      }
    >({
      queryFn: async (p) => {
        try {
          const raw = await amadeusFlightOffersSearch({
            origin: p.origin,
            destination: p.destination,
            departDate: p.departDate,
            returnDate: p.returnDate,
            adults: 1,
            max: 50,
            currencyCode: "EUR",
          });
          const allFlights = raw.map(normalizeOffer);
          const startIndex = (p.page - 1) * p.pageSize;
          const endIndex = startIndex + p.pageSize;
          const flights = allFlights.slice(startIndex, endIndex);
          
          return {
            data: {
              flights,
              total: allFlights.length,
              hasMore: endIndex < allFlights.length,
            },
          };
        } catch (error: any) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
      },
      // Serialize query key without page/pageSize so we can cache all pages
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, pageSize, ...rest } = queryArgs;
        return `${endpointName}(${JSON.stringify(rest)})`;
      },
      // Merge paginated results - append new pages to existing ones
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // First page - replace everything
          return newItems;
        }
        // Subsequent pages - append to existing
        return {
          flights: [...(currentCache?.flights ?? []), ...newItems.flights],
          total: newItems.total,
          hasMore: newItems.hasMore,
        };
      },
      // Force refetch when page changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useAirportAutocompleteQuery,
  useGetFlightOffersQuery,
  useGetFlightOffersPaginatedQuery,
} = flightsApi;
