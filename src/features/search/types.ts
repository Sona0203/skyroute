export type StopsFilter = "any" | "0" | "1" | "2+";

export type TripType = "one-way" | "round-trip";

export type SearchState = {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    tripType: TripType;
  
    submittedQuery: SubmittedQuery;
  
    filters: {
      stops: StopsFilter;
      airlines: string[];
      priceMin?: number;
      priceMax?: number;
    };
  
    sort: "price" | "duration" | "bestValue";
};

export type SubmittedQuery = {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
} | null;
