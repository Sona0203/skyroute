import "dotenv/config";
import express from "express";
import cors from "cors";
import { airportAutocomplete, flightOffersSearch } from "./amadeus.js";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const MOCK_MODE = process.env.MOCK_MODE === "1";

app.use(cors({ origin: CORS_ORIGIN }));

app.get("/health", (_, res) => res.json({ ok: true, mock: MOCK_MODE }));

app.get("/api/airports", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.status(400).json({ error: "Missing query param: q" });

    if (MOCK_MODE) {
      return res.json({
        data: [
          { id: "EVN", iataCode: "EVN", name: "Yerevan", cityName: "Yerevan", countryCode: "AM", type: "AIRPORT" },
          { id: "LCA", iataCode: "LCA", name: "Larnaca", cityName: "Larnaca", countryCode: "CY", type: "AIRPORT" },
          { id: "FCO", iataCode: "FCO", name: "Rome Fiumicino", cityName: "Rome", countryCode: "IT", type: "AIRPORT" },
        ].filter((x) => x.iataCode.toLowerCase().includes(q.toLowerCase()) || x.name.toLowerCase().includes(q.toLowerCase())),
      });
    }

    const data = await airportAutocomplete(q);
    res.json({ data });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "airports error" });
  }
});

app.get("/api/flights/search", async (req, res) => {
  try {
    const origin = String(req.query.origin ?? "").trim().toUpperCase();
    const destination = String(req.query.destination ?? "").trim().toUpperCase();
    const departDate = String(req.query.departDate ?? "").trim();
    const returnDate = String(req.query.returnDate ?? "").trim() || undefined;

    if (!origin || !destination || !departDate) {
      return res.status(400).json({ error: "Missing required params: origin, destination, departDate" });
    }

    if (MOCK_MODE) {
      return res.json({ data: [] });
    }

    const data = await flightOffersSearch({
      origin,
      destination,
      departDate,
      returnDate,
      adults: 1,
      max: 50,
      currencyCode: "EUR",
    });

    res.json({ data });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "flights error" });
  }
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}  mock=${MOCK_MODE}`);
});
