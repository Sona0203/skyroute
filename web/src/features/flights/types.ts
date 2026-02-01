export type AirportOption = {
    id: string;
    iataCode: string;
    label: string; // Example: "EVN — Yerevan, Armenia"
  };
  
  export type FlightLeg = {
    stopsCount: number;
    departureDateTime: string;
    arrivalDateTime: string;
    durationMinutes: number;
  
    segments: Array<{
      from: string;
      to: string;
      departAt: string;
      arriveAt: string;
      carrier: string;
      flightNumber: string;
    }>;
  };
  
  export type FlightOffer = {
    id: string;
    priceTotal: number;
    currency: string;
  
    validatingAirline: string;
    legs: FlightLeg[]; // One leg means one-way, two legs means round-trip
  };
  
  export type ChartPoint = {
    t: string;
    median: number;
    min: number;
    max: number;
  };
  
  