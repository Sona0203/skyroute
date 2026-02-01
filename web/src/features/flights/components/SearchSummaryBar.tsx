import { AppBar, Box, Container, Stack, Typography } from "@mui/material";
import { useAppSelector } from "../../../app/hooks";

type Props = {
  flightCount?: number;
};

export default function SearchSummaryBar({ flightCount = 0 }: Props) {
  const submittedQuery = useAppSelector((s) => s.search.submittedQuery);
  
  if (!submittedQuery) return null;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        top: { xs: 60, sm: 70 },
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        zIndex: (theme) => theme.zIndex.appBar - 1,
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {submittedQuery.origin} → {submittedQuery.destination}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {submittedQuery.departDate}
              {submittedQuery.returnDate && ` - ${submittedQuery.returnDate}`}
            </Typography>
            {flightCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                • {flightCount} flights
              </Typography>
            )}
          </Stack>
        </Box>
      </Container>
    </AppBar>
  );
}
