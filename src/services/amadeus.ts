// Amadeus API client for direct frontend calls
type TokenCache = {
  token: string | null;
  expiresAtMs: number; // epoch ms
};

const tokenCache: TokenCache = { token: null, expiresAtMs: 0 };

const BASE_URL = import.meta.env.VITE_AMADEUS_BASE_URL || "https://test.api.amadeus.com";
const CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  // Use cached token if it's still valid (with 10 second buffer)
  if (tokenCache.token && now < tokenCache.expiresAtMs - 10_000) {
    return tokenCache.token;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing Amadeus API credentials. Please set VITE_AMADEUS_CLIENT_ID and VITE_AMADEUS_CLIENT_SECRET");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", CLIENT_ID);
  body.set("client_secret", CLIENT_SECRET);

  const resp = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Amadeus token error (${resp.status}): ${text}`);
  }

  const json: any = await resp.json();
  tokenCache.token = json.access_token;
  tokenCache.expiresAtMs = Date.now() + Number(json.expires_in ?? 0) * 1000;

  return tokenCache.token!;
}

async function amadeusGet(path: string, query: Record<string, string | undefined>, retries = 2): Promise<any> {
  const token = await getAccessToken();

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") qs.set(k, v);
  }

  const url = `${BASE_URL}${path}?${qs.toString()}`;
  
  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await resp.text();
    
    // Handle rate limiting (429) with retry logic
    if (resp.status === 429) {
      if (retries > 0) {
        // Wait with exponential backoff: 1s, 2s, 4s
        const waitTime = Math.pow(2, 2 - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return amadeusGet(path, query, retries - 1);
      }
      throw new Error(`Amadeus API rate limit exceeded. Please wait a moment before searching again.`);
    }
    
    // Handle bad request (400) - likely invalid parameters
    if (resp.status === 400) {
      // Try to parse error details if available
      let errorMsg = "Invalid request. Please check your search parameters.";
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMsg = errorJson.errors[0].detail || errorMsg;
        }
      } catch {
        // If parsing fails, use default message
      }
      throw new Error(errorMsg);
    }
    
    if (!resp.ok) {
      throw new Error(`Amadeus GET ${path} (${resp.status}): ${text}`);
    }
    
    return JSON.parse(text);
  } catch (error: any) {
    // If it's already our custom error, re-throw it
    if (error.message && error.message.includes("rate limit")) {
      throw error;
    }
    // Otherwise, wrap it
    throw new Error(`Amadeus API error: ${error.message}`);
  }
}

// Airport autocomplete using Amadeus API
export async function airportAutocomplete(keyword: string) {
  // Clean the keyword: remove special characters, em dashes, and extra whitespace
  const cleanedKeyword = keyword
    .replace(/[\u2013\u2014\u2015]/g, "-") // Replace em dashes, en dashes with regular dash
    .replace(/[^\w\s-]/g, "") // Remove special characters except letters, numbers, spaces, and dashes
    .trim()
    .replace(/\s+/g, " "); // Replace multiple spaces with single space
  
  // Don't make API call if keyword is too short or empty after cleaning
  if (!cleanedKeyword || cleanedKeyword.length < 2) {
    return [];
  }

  const json = await amadeusGet("/v1/reference-data/locations", {
    keyword: cleanedKeyword,
    subType: "AIRPORT,CITY",
    "page[limit]": "10",
    view: "LIGHT",
  });

  const data = Array.isArray(json.data) ? json.data : [];
  return data.map((x: any) => ({
    id: String(x.id ?? ""),
    iataCode: String(x.iataCode ?? ""),
    name: String(x.name ?? ""),
    type: String(x.subType ?? x.type ?? ""),
    cityName: String(x.address?.cityName ?? ""),
    countryCode: String(x.address?.countryCode ?? ""),
  }));
}

// Flight offers search using Amadeus API
export async function flightOffersSearch(params: {
  origin: string;
  destination: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  adults?: number;
  nonStop?: boolean;
  max?: number;
  currencyCode?: string;
}) {
  const json = await amadeusGet("/v2/shopping/flight-offers", {
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departDate,
    returnDate: params.returnDate,
    adults: String(params.adults ?? 1),
    nonStop: params.nonStop ? "true" : undefined,
    max: String(params.max ?? 50),
    currencyCode: params.currencyCode ?? "EUR",
  });

  return Array.isArray(json.data) ? json.data : [];
}
