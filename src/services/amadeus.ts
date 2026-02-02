// Amadeus API client
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
  // Use cached token if still valid (10 second buffer)
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

async function amadeusGet(path: string, query: Record<string, string | undefined>, retries = 3): Promise<any> {
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
    
    // Retry on rate limit errors
    if (resp.status === 429) {
      if (retries > 0) {
        // Exponential backoff with longer waits: 2s, 4s, 8s
        const waitTime = Math.pow(2, 4 - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return amadeusGet(path, query, retries - 1);
      }
      throw new Error(`Amadeus API rate limit exceeded. Please wait a moment before searching again.`);
    }
    
    // Handle bad request errors
    if (resp.status === 400) {
      // Try to extract error message
      let errorMsg = "Invalid request. Please check your search parameters.";
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMsg = errorJson.errors[0].detail || errorMsg;
        }
      } catch {
        // Fall back to default message if parsing fails
      }
      throw new Error(errorMsg);
    }
    
    if (!resp.ok) {
      throw new Error(`Amadeus GET ${path} (${resp.status}): ${text}`);
    }
    
    return JSON.parse(text);
  } catch (error: any) {
    // Re-throw custom errors as-is
    if (error.message && error.message.includes("rate limit")) {
      throw error;
    }
    // Wrap other errors
    throw new Error(`Amadeus API error: ${error.message}`);
  }
}

// Airport autocomplete
export async function airportAutocomplete(keyword: string) {
  // Clean keyword: remove special characters and normalize
  const cleanedKeyword = keyword
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, " ");
  
  // Skip API call if keyword is too short
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

// Flight offers search
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
