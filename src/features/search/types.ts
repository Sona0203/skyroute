export type StopsFilter = "any" | "0" | "1" | "2+";

export type TripType = "one-way" | "round-trip";

export type SearchState = {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    tripType: TripType;
    travelers: number;
  
    submittedQuery: SubmittedQuery;
  
    filters: {
      stops: StopsFilter;
      airlines: string[];
      priceMin?: number;
      priceMax?: number;
    };
  
    sort: "price" | "duration" | "bestValue";
    datesWithNoFlights: string[]; // Dates (YYYY-MM-DD) that returned no flights for current route
};

export type SubmittedQuery = {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    travelers: number;
} | null;
