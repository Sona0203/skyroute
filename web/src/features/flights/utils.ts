import type { FlightOffer } from "./types";

export function getTotalDurationMinutes(f: FlightOffer): number {
  return f.legs.reduce((sum, leg) => sum + (leg.durationMinutes ?? 0), 0);
}

export function getFlightBadges(
  flight: FlightOffer,
  allFlights: FlightOffer[]
): Array<"cheapest" | "fastest" | "best"> {
  const badges: Array<"cheapest" | "fastest" | "best"> = [];
  
  if (allFlights.length === 0) return badges;

  const prices = allFlights.map((f) => f.priceTotal);
  const durations = allFlights.map((f) => getTotalDurationMinutes(f));
  const minPrice = Math.min(...prices);
  const minDuration = Math.min(...durations);

  if (flight.priceTotal === minPrice) {
    badges.push("cheapest");
  }

  if (getTotalDurationMinutes(flight) === minDuration) {
    badges.push("fastest");
  }

  // If it's both cheapest and fastest, that's the best option
  if (badges.length === 2) {
    badges.length = 0;
    badges.push("best");
  }

  return badges;
}

// Map airline codes to their logos (using emoji as a simple fallback for now)
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
