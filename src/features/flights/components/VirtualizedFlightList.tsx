import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { useEffect, useRef } from "react";
import type { FlightOffer } from "../types";
import FlightCard from "./FlightCard";
import { getFlightBadges } from "../utils";

type Props = {
  flights: FlightOffer[];
  allFlights: FlightOffer[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
};

function VirtualizedFlightList({ 
  flights, 
  allFlights, 
  onLoadMore, 
  hasMore, 
  isLoadingMore 
}: Props) {
  const loadMoreTriggeredRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore || !hasMore || isLoadingMore) return;

    const handleScroll = () => {
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (scrollBottom < 300 && !loadMoreTriggeredRef.current) {
        loadMoreTriggeredRef.current = true;
        onLoadMore();
        setTimeout(() => {
          loadMoreTriggeredRef.current = false;
        }, 1000);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, hasMore, isLoadingMore]);

  useEffect(() => {
    loadMoreTriggeredRef.current = false;
  }, [flights.length]);

  if (flights.length === 0) {
    return null;
  }

  return (
    <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: "0 !important", marginTop: "0 !important" }}>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 800,
          fontSize: { xs: "0.95rem", sm: "1rem" },
          px: { xs: 0.5, sm: 0 },
        }}
      >
        Results ({allFlights.length})
      </Typography>
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          maxHeight: { xs: "70vh", sm: "75vh" },
          overflowY: "auto",
          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.5, sm: 1 },
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        <Stack spacing={1}>
          {flights.map((flight) => {
            const badges = getFlightBadges(flight, allFlights);
            return (
              <Box key={flight.id} sx={{ px: { xs: 0, sm: 0 } }}>
                <FlightCard f={flight} allFlights={allFlights} badges={badges} />
              </Box>
            );
          })}
          {(hasMore || isLoadingMore) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 3,
                minHeight: 60,
              }}
            >
              {isLoadingMore && <CircularProgress size={24} />}
            </Box>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

export default VirtualizedFlightList;
