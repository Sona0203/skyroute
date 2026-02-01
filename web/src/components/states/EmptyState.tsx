import { Paper, Stack, Typography } from "@mui/material";

export default function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
