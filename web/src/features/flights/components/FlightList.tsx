import { Stack, Typography } from "@mui/material";
import type { FlightOffer } from "../types";
import FlightCard from "./FlightCard";

export default function FlightList({ flights }: { flights: FlightOffer[] }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        Results ({flights.length})
      </Typography>
      <Stack spacing={1}>
        {flights.map((f) => (
          <FlightCard key={f.id} f={f} />
        ))}
      </Stack>
    </Stack>
  );
}
