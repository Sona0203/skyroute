import { Box, Chip, Paper, Stack, Tooltip, Typography, Divider, Collapse, IconButton, useTheme, alpha } from "@mui/material";
import { memo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { FlightOffer, FlightLeg } from "../types";
import { getAirlineLogo } from "../utils";
import { useMobile } from "../../../app/hooks";

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
  const theme = useTheme();

  if (stops === 0) {
    return (
      <Chip
        size="small"
        label="Direct"
        sx={{
          fontWeight: 700,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
        }}
      />
    );
  }

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
          sx={{
            cursor: "help",
            fontWeight: 600,
            borderColor: alpha(theme.palette.warning.main, 0.3),
            color: theme.palette.warning.main,
          }}
        />
      </span>
    </Tooltip>
  );
}

function LegRow({ title, leg }: { title: "Outbound" | "Return"; leg: FlightLeg }) {
  const chain = routeChain(leg);
  const from = chain[0] ?? "—";
  const to = chain[chain.length - 1] ?? "—";
  const theme = useTheme();
  const isMobile = useMobile("md");

  return (
    <Box
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: { xs: 1.5, sm: 2 },
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
        {/* Route header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip 
            size="small" 
            label={title} 
            sx={{ 
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }} 
          />
          <StopsChip leg={leg} />
        </Stack>

        {/* Time and duration */}
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={{ xs: 1, sm: 2 }} 
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FlightTakeoffIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: "text.secondary" }} />
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: 0.5,
                fontSize: { xs: "0.95rem", sm: "1.25rem" }
              }}
            >
              {fmtTime(leg.departureDateTime)}
            </Typography>
          </Stack>
          
          <Box 
            sx={{ 
              flex: 1, 
              position: "relative", 
              height: { xs: 1.5, sm: 2 }, 
              bgcolor: "divider", 
              borderRadius: 1,
              width: { xs: "100%", sm: "auto" },
              display: { xs: isMobile ? "block" : "block", sm: "block" }
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                px: { xs: 0.75, sm: 1 },
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: "text.secondary" }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    color: "text.secondary",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" }
                  }}
                >
                  {fmtDuration(leg.durationMinutes)}
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: 0.5,
                fontSize: { xs: "0.95rem", sm: "1.25rem" }
              }}
            >
              {fmtTime(leg.arrivalDateTime)}
            </Typography>
            <FlightLandIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: "text.secondary" }} />
          </Stack>
        </Stack>

        {/* Airport codes */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
            {from}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
            {to}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function FlightCard({ f, badges }: { f: FlightOffer; allFlights: FlightOffer[]; badges: Array<"cheapest" | "fastest" | "best"> }) {
  const theme = useTheme();
  const isMobile = useMobile("md");
  const [expanded, setExpanded] = useState(false);
  const out = f.legs[0];
  const ret = f.legs[1];

  return (
    <Paper
      variant="outlined"
      sx={{
        pt: { xs: 2.5, sm: 3 },
        px: { xs: 2, sm: 2.5 },
        pb: { xs: 2, sm: 2.5 },
        borderRadius: { xs: 2, sm: 3 },
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        cursor: "pointer",
        bgcolor: "background.paper",
        "&:hover": {
          transform: isMobile ? "none" : "translateY(-2px)",
          boxShadow: isMobile 
            ? `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`
            : `0 6px 20px ${alpha(theme.palette.common.black, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      }}
    >
      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        {/* Main content */}
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          justifyContent="space-between" 
          spacing={{ xs: 2, sm: 3 }}
        >
          {/* LEFT - Flight details */}
          <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0, flex: 1 }}>
            {out && <LegRow title="Outbound" leg={out} />}
            {ret && <LegRow title="Return" leg={ret} />}

            {/* Airline and badges */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ pt: 0.5 }}>
              <Chip
                icon={<Box component="span">{getAirlineLogo(f.validatingAirline)}</Box>}
                label={f.validatingAirline}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  bgcolor: "transparent",
                }}
              />
              {badges.length > 0 && (
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  {badges.map((badge) => (
                    <Chip
                      key={badge}
                      size="small"
                      label={badge === "best" ? "⭐ Best" : badge === "cheapest" ? "💰 Cheapest" : "⚡ Fastest"}
                      color={badge === "best" ? "primary" : badge === "cheapest" ? "success" : "info"}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        height: 24,
                        boxShadow: `0 2px 4px ${alpha(theme.palette[badge === "best" ? "primary" : badge === "cheapest" ? "success" : "info"].main, 0.3)}`,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>

          {/* RIGHT - Price */}
          <Stack
            direction={{ xs: "row", sm: "column" }}
            alignItems={{ xs: "center", sm: "flex-end" }}
            justifyContent={{ xs: "space-between", sm: "space-between" }}
            spacing={1}
            sx={{
              minWidth: { xs: "100%", sm: 120 },
              pt: { xs: 1, sm: 0 },
              borderTop: { xs: `1px solid ${alpha(theme.palette.divider, 0.3)}`, sm: "none" },
            }}
          >
            <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={0.25}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.2,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                {Math.round(f.priceTotal)} {f.currency}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                }}
              >
                total
              </Typography>
            </Stack>
            {isMobile && (
              <IconButton
                size="medium"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  width: 40,
                  height: 40,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* Mobile expandable details */}
        {isMobile && (
          <Collapse in={expanded}>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={2}>
              {out && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      letterSpacing: 1,
                    }}
                  >
                    Outbound Details
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {out.segments.map((seg, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <Box component="span" sx={{ color: "primary.main" }}>
                            {seg.carrier} {seg.flightNumber}
                          </Box>
                          : {seg.from} → {seg.to}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmtTime(seg.departAt)} - {fmtTime(seg.arriveAt)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              {ret && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      letterSpacing: 1,
                    }}
                  >
                    Return Details
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {ret.segments.map((seg, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <Box component="span" sx={{ color: "primary.main" }}>
                            {seg.carrier} {seg.flightNumber}
                          </Box>
                          : {seg.from} → {seg.to}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmtTime(seg.departAt)} - {fmtTime(seg.arriveAt)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Collapse>
        )}
      </Stack>
    </Paper>
  );
}

export default memo(FlightCard);
