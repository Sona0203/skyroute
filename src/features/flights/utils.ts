import type { FlightOffer } from "./types";

export function getTotalDurationMinutes(f: FlightOffer): number {
  return f.legs.reduce((sum, leg) => sum + (leg.durationMinutes ?? 0), 0);
}

export function getFlightBadges(
  flight: FlightOffer,
  allFlights: FlightOffer[]
): Array<"cheapest" | "fastest" | "best"> {
  const badges: Array<"cheapest" | "fastest" | "best"> = [];
  
  if (allFlights.length === 0 || allFlights.length === 1) return badges;

  const prices = allFlights.map((f) => f.priceTotal);
  const durations = allFlights.map((f) => getTotalDurationMinutes(f));
  const minPrice = Math.min(...prices);
  const minDuration = Math.min(...durations);

  // Small tolerance for floating point comparison
  const priceEpsilon = 0.01;
  const durationEpsilon = 1;

  const isCheapest = Math.abs(flight.priceTotal - minPrice) < priceEpsilon;
  const flightDuration = getTotalDurationMinutes(flight);
  const isFastest = Math.abs(flightDuration - minDuration) < durationEpsilon;

  if (isCheapest && isFastest) {
    badges.push("best");
  } else {
    if (isCheapest) {
      badges.push("cheapest");
    }
    if (isFastest) {
      badges.push("fastest");
    }
  }

  return badges;
}

// Airline logo mapping
export const AIRLINE_LOGOS: Record<string, string> = {
  "AA": "✈️", // American Airlines
  "DL": "✈️", // Delta
  "UA": "✈️", // United
  "BA": "✈️", // British Airways
  "LH": "✈️", // Lufthansa
  "AF": "✈️", // Air France
  "KL": "✈️", // KLM
  "EK": "✈️", // Emirates
  "QR": "✈️", // Qatar Airways
  "SQ": "✈️", // Singapore Airlines
};

export function getAirlineLogo(code: string): string {
  return AIRLINE_LOGOS[code] || "✈️";
}
