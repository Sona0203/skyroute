import { Box, Paper, Skeleton, Stack } from "@mui/material";

export default function SkeletonCard() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={3}>
        <Stack spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
          <Stack spacing={0.5}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
          <Box sx={{ my: 0.5 }}>
            <Skeleton variant="rectangular" height={1} />
          </Box>
          <Stack spacing={0.5}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
          <Skeleton variant="text" width="30%" height={16} />
        </Stack>
        <Stack alignItems="flex-end" spacing={0.5} sx={{ minWidth: 120 }}>
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="text" width={40} height={16} />
        </Stack>
      </Stack>
    </Paper>
  );
}
