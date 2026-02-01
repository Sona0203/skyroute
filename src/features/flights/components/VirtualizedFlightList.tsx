import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { VariableSizeList as List } from "react-window";
import { useEffect, useRef, useCallback, useMemo } from "react";
import type { FlightOffer } from "../types";
import FlightCard from "./FlightCard";
import { getFlightBadges } from "../utils";

const PAGE_SIZE = 10;
const BASE_ITEM_HEIGHT = 240; // Base height for one-way flights
const RETURN_FLIGHT_EXTRA_HEIGHT = 180; // Extra height for return flight

type Props = {
  flights: FlightOffer[];
  allFlights: FlightOffer[]; // All flights for badge calculation
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
  const listRef = useRef<List>(null);
  const loadMoreTriggeredRef = useRef(false);

  // Calculate total height - use viewport height for better scrolling experience
  const listHeight = useMemo(() => {
    // Use viewport height minus space for header, search bar, and other UI elements
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const availableHeight = Math.max(500, viewportHeight - 350); // Minimum 500px, or viewport minus UI space
    
    return availableHeight;
  }, []);

  // Calculate item height based on whether it's round-trip
  const getItemSize = useCallback(
    (index: number) => {
      const flight = flights[index];
      if (!flight) return BASE_ITEM_HEIGHT;
      // Round-trip flights have 2 legs, so they need more height
      return flight.legs.length > 1 ? BASE_ITEM_HEIGHT + RETURN_FLIGHT_EXTRA_HEIGHT : BASE_ITEM_HEIGHT;
    },
    [flights]
  );

  // Handle scroll for infinite loading - trigger when near bottom
  const handleScroll = useCallback(
    ({ scrollOffset, scrollUpdateWasRequested }: { scrollOffset: number; scrollUpdateWasRequested: boolean }) => {
      if (!onLoadMore || !hasMore || isLoadingMore || scrollUpdateWasRequested || loadMoreTriggeredRef.current) {
        return;
      }

      // Get the total height of all items
      let totalHeight = 0;
      for (let i = 0; i < flights.length; i++) {
        totalHeight += getItemSize(i);
      }
      // Add height for loading indicator if present
      if (hasMore || isLoadingMore) {
        totalHeight += 60;
      }

      // Check if we're near the bottom (within 400px for better UX)
      const distanceFromBottom = totalHeight - scrollOffset - listHeight;
      if (distanceFromBottom < 400) {
        loadMoreTriggeredRef.current = true;
        onLoadMore();

        // Reset after a delay to allow for loading
        setTimeout(() => {
          loadMoreTriggeredRef.current = false;
        }, 1500);
      }
    },
    [onLoadMore, hasMore, isLoadingMore, flights.length, listHeight, getItemSize]
  );

  // Reset load more trigger when flights change
  useEffect(() => {
    loadMoreTriggeredRef.current = false;
  }, [flights.length]);

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const flight = flights[index];
      if (!flight) return null;

      const badges = getFlightBadges(flight, allFlights);

      return (
        <div style={style}>
          <Box sx={{ px: 0.5, pb: 1 }}>
            <FlightCard f={flight} allFlights={allFlights} badges={badges} />
          </Box>
        </div>
      );
    },
    [flights, allFlights]
  );

  if (flights.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        Results ({allFlights.length})
      </Typography>
      <Box
        sx={{
          width: "100%",
          height: listHeight,
          position: "relative",
        }}
      >
        <List
          ref={listRef}
          height={listHeight}
          itemCount={flights.length + (hasMore || isLoadingMore ? 1 : 0)}
          itemSize={(index) => {
            if (index >= flights.length) return 60; // Height for loading indicator
            return getItemSize(index);
          }}
          width="100%"
          overscanCount={5}
          onScroll={handleScroll}
        >
          {({ index, style }) => {
            // Show loading indicator as last item
            if (index >= flights.length) {
              return (
                <div style={style}>
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
                </div>
              );
            }
            return Row({ index, style });
          }}
        </List>
      </Box>
    </Stack>
  );
}

export default VirtualizedFlightList;
