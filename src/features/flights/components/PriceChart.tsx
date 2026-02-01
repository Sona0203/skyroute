import { Paper, Stack, Typography } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "../types";

export default function PriceChart({
  series,
  currency,
}: {
  series: ChartPoint[];
  currency: string;
}) {
  // Figure out what the price trend is telling us
  const getPriceInsight = () => {
    if (series.length < 2) return null;
    const prices = series.map((p) => p.median);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    if (last < first * 0.9) {
      return `Prices drop ${Math.round(((first - last) / first) * 100)}% by end of day — good time to book!`;
    } else if (last > first * 1.1) {
      return `Prices rise ${Math.round(((last - first) / first) * 100)}% by end of day — book early.`;
    } else if (max - min > avg * 0.2) {
      return `Price varies by ${Math.round(((max - min) / avg) * 100)}% — shop around for best deals.`;
    }
    return `Prices are relatively stable throughout the day.`;
  };

  const insight = getPriceInsight();

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        height: { xs: 240, sm: 280 },
        borderRadius: { xs: 2, sm: 3 },
      }}
    >
      <Stack spacing={1} sx={{ height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: "0.95rem", sm: "1rem" }
            }}
          >
            Price trend (filtered)
          </Typography>
        </Stack>
        {insight && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
            💡 {insight}
          </Typography>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              tickFormatter={(v) => {
                // Just show the hour, like "14:00"
                const hh = String(v).slice(11, 13);
                return `${hh}:00`;
              }}
            />
            <YAxis tickFormatter={(v) => `${v}`} />
            <Tooltip
              formatter={(value: any, name) => [`${value} ${currency}`, name]}
              labelFormatter={(label) => `Bucket: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="median"
              dot={false}
              stroke="#1976d2"
              strokeWidth={2}
              animationDuration={800}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="min"
              dot={false}
              stroke="#4caf50"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              animationDuration={800}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="max"
              dot={false}
              stroke="#f44336"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              animationDuration={800}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </Stack>
    </Paper>
  );
}
