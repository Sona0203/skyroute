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
  return (
    <Paper variant="outlined" sx={{ p: 2, height: 280 }}>
      <Stack spacing={1} sx={{ height: "100%" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Price trend (filtered)
        </Typography>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              tickFormatter={(v) => {
                // show hour only
                const hh = String(v).slice(11, 13);
                return `${hh}:00`;
              }}
            />
            <YAxis tickFormatter={(v) => `${v}`} />
            <Tooltip
              formatter={(value: any, name) => [`${value} ${currency}`, name]}
              labelFormatter={(label) => `Bucket: ${label}`}
            />
            <Line type="monotone" dataKey="median" dot={false} />
            <Line type="monotone" dataKey="min" dot={false} />
            <Line type="monotone" dataKey="max" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Stack>
    </Paper>
  );
}
