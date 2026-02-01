import { Box, Chip, Paper, Stack, Tooltip, Typography, Divider } from "@mui/material";
import { memo } from "react";
import type { FlightOffer, FlightLeg } from "../types";

function fmtTime(iso: string) {
  return iso ? iso.slice(11, 16) : "—";
}

function minutesBetween(aIso: string, bIso: string) {
  const a = Date.parse(aIso);
  const b = Date.parse(bIso);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}

function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function stopsLabel(n: number) {
  if (n === 0) return "Direct";
  if (n === 1) return "1 stop";
  return `${n} stops`;
}

function routeChain(leg: FlightLeg) {
  const chain: string[] = [];
  for (const seg of leg.segments) {
    if (chain.length === 0) chain.push(seg.from);
    chain.push(seg.to);
  }
  return chain;
}

function layovers(leg: FlightLeg) {
  const res: Array<{ at: string; minutes: number }> = [];
  for (let i = 0; i < leg.segments.length - 1; i++) {
    const cur = leg.segments[i];
    const next = leg.segments[i + 1];
    res.push({
      at: cur.to,
      minutes: minutesBetween(cur.arriveAt, next.departAt),
    });
  }
  return res;
}

function LayoverTooltipContent({ leg }: { leg: FlightLeg }) {
  const lay = layovers(leg);
  const chain = routeChain(leg);

  return (
    <Box sx={{ p: 0.75 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
        Layovers
      </Typography>
      <Typography variant="caption" sx={{ display: "block", opacity: 0.85, mb: 0.75 }}>
        {chain.join(" → ")}
      </Typography>

      <Stack spacing={0.5}>
        {lay.map((x, idx) => (
          <Stack key={`${x.at}-${idx}`} direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {x.at}
            </Typography>
            <Typography variant="body2">{fmtDuration(x.minutes)}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function StopsChip({ leg }: { leg: FlightLeg }) {
  const stops = leg.stopsCount;

  if (stops === 0) return <Chip size="small" label="Direct" />;

  return (
    <Tooltip
      title={<LayoverTooltipContent leg={leg} />}
      placement="top"
      arrow
      enterDelay={150}
    >
      <span>
        <Chip
          size="small"
          variant="outlined"
          label={stopsLabel(stops)}
          sx={{ cursor: "help" }}
        />
      </span>
    </Tooltip>
  );
}

function LegRow({ title, leg }: { title: "Outbound" | "Return"; leg: FlightLeg }) {
  const chain = routeChain(leg);
  const from = chain[0] ?? "—";
  const to = chain[chain.length - 1] ?? "—";

  return (
    <Stack spacing={0.3}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            {fmtTime(leg.departureDateTime)} → {fmtTime(leg.arrivalDateTime)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fmtDuration(leg.durationMinutes)}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={title} sx={{ fontWeight: 800 }} />
          <StopsChip leg={leg} />
        </Stack>
      </Stack>

      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {from} → {to}
      </Typography>
    </Stack>
  );
}

function FlightCard({ f }: { f: FlightOffer }) {
  const out = f.legs[0];
  const ret = f.legs[1];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        transition: "transform 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={3}>
        {/* LEFT */}
        <Stack spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
          {out && <LegRow title="Outbound" leg={out} />}
          {ret && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <LegRow title="Return" leg={ret} />
            </>
          )}

          <Typography variant="caption" color="text.secondary">
            Airline: {f.validatingAirline}
          </Typography>
        </Stack>

        {/* RIGHT */}
        <Stack alignItems="flex-end" spacing={0.25} sx={{ minWidth: 120 }}>
          <Typography variant="h6" sx={{ fontWeight: 950 }}>
            {Math.round(f.priceTotal)} {f.currency}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            total
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default memo(FlightCard);
