type TokenCache = {
    token: string | null;
    expiresAtMs: number; // epoch ms
  };
  
  const tokenCache: TokenCache = { token: null, expiresAtMs: 0 };
  
  const BASE_URL = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
  const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
  
  function requireEnv(name: string, value: string | undefined) {
    if (!value) throw new Error(`Missing env: ${name}`);
    return value;
  }
  
  async function getAccessToken(): Promise<string> {
    const now = Date.now();
    if (tokenCache.token && now < tokenCache.expiresAtMs - 10_000) {
      return tokenCache.token;
    }
  
    const clientId = requireEnv("AMADEUS_CLIENT_ID", CLIENT_ID);
    const clientSecret = requireEnv("AMADEUS_CLIENT_SECRET", CLIENT_SECRET);
  
    const body = new URLSearchParams();
    body.set("grant_type", "client_credentials");
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);
  
    // Token endpoint for Self-Service test env. :contentReference[oaicite:2]{index=2}
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
  
  async function amadeusGet(path: string, query: Record<string, string | undefined>) {
    const token = await getAccessToken();
  
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") qs.set(k, v);
    }
  
    const url = `${BASE_URL}${path}?${qs.toString()}`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`Amadeus GET ${path} (${resp.status}): ${text}`);
    }
    return JSON.parse(text);
  }
  
  // Autocomplete: Airport & City Search API. :contentReference[oaicite:3]{index=3}
  export async function airportAutocomplete(keyword: string) {
    const json = await amadeusGet("/v1/reference-data/locations", {
      keyword,
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
  
  // Flights: Flight Offers Search API (v2). :contentReference[oaicite:4]{index=4}
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
  
    // pass-through: frontend normalizes
    return Array.isArray(json.data) ? json.data : [];
  }
  