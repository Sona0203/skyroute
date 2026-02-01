import { Box, Stack, Typography, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { VariableSizeList as List } from "react-window";
import { useEffect, useRef, useCallback, useMemo } from "react";
import type { FlightOffer } from "../types";
import FlightCard from "./FlightCard";
import { getFlightBadges } from "../utils";

const BASE_ITEM_HEIGHT = 240; // Base height for one-way flights (desktop)
const BASE_ITEM_HEIGHT_MOBILE = 550; // Base height for one-way flights (mobile - very generous to prevent overlap)
const RETURN_FLIGHT_EXTRA_HEIGHT = 180; // Extra height for return flight
const RETURN_FLIGHT_EXTRA_HEIGHT_MOBILE = 450; // Extra height for return flight (mobile - very generous)
const CARD_SPACING_DESKTOP = 8; // Spacing between cards (desktop pb: 1 = 8px)
const CARD_SPACING_MOBILE = 24; // Spacing between cards (mobile pb: 3 = 24px)

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const listRef = useRef<List>(null);
  const loadMoreTriggeredRef = useRef(false);

  // Calculate total height - use viewport height for better scrolling experience
  const listHeight = useMemo(() => {
    // Use viewport height minus space for header, search bar, and other UI elements
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    // On mobile, we need more space for UI elements
    const uiSpace = isMobile ? 400 : 350;
    const availableHeight = Math.max(500, viewportHeight - uiSpace);
    
    return availableHeight;
  }, [isMobile]);

  // Calculate item height based on whether it's round-trip and screen size
  const getItemSize = useCallback(
    (index: number) => {
      const flight = flights[index];
      if (!flight) {
        const spacing = isMobile ? CARD_SPACING_MOBILE : CARD_SPACING_DESKTOP;
        return isMobile ? BASE_ITEM_HEIGHT_MOBILE + spacing : BASE_ITEM_HEIGHT + spacing;
      }
      
      // Base height depends on screen size
      const baseHeight = isMobile ? BASE_ITEM_HEIGHT_MOBILE : BASE_ITEM_HEIGHT;
      const extraHeight = isMobile ? RETURN_FLIGHT_EXTRA_HEIGHT_MOBILE : RETURN_FLIGHT_EXTRA_HEIGHT;
      const spacing = isMobile ? CARD_SPACING_MOBILE : CARD_SPACING_DESKTOP;
      
      // Round-trip flights have 2 legs, so they need more height
      const cardHeight = flight.legs.length > 1 ? baseHeight + extraHeight : baseHeight;
      
      // Add spacing between cards (included in the height so cards don't overlap)
      return cardHeight + spacing;
    },
    [flights, isMobile]
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
        <div 
          style={{
            ...style,
            overflow: "hidden", // Prevent content from overflowing
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ 
            px: { xs: 0, sm: 0.5 }, 
            pb: { xs: 3, sm: 1 }, // Spacing between cards
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}>
            <Box sx={{ flex: "0 0 auto" }}>
              <FlightCard f={flight} allFlights={allFlights} badges={badges} />
            </Box>
          </Box>
        </div>
      );
    },
    [flights, allFlights]
  );

  if (flights.length === 0) {
    return null;
  }

  // On mobile, use a simple scrollable list without virtualization to avoid overlap issues
  if (isMobile) {
    return (
      <Stack spacing={{ xs: 1, sm: 1.5 }}>
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
          sx={{
            width: "100%",
            maxHeight: listHeight,
            overflowY: "auto",
            px: { xs: 0.5, sm: 0 },
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
          onScroll={(e) => {
            const target = e.currentTarget;
            const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
            if (scrollBottom < 300 && hasMore && !isLoadingMore && !loadMoreTriggeredRef.current) {
              loadMoreTriggeredRef.current = true;
              onLoadMore?.();
              setTimeout(() => {
                loadMoreTriggeredRef.current = false;
              }, 1000);
            }
          }}
        >
          <Stack spacing={2}>
            {flights.map((flight) => {
              const badges = getFlightBadges(flight, allFlights);
              return (
                <Box key={flight.id} sx={{ px: { xs: 0, sm: 0.5 } }}>
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

  // Desktop: use virtualization
  return (
    <Stack spacing={{ xs: 1, sm: 1.5 }}>
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
        sx={{
          width: "100%",
          height: listHeight,
          position: "relative",
          px: { xs: 0.5, sm: 0 },
        }}
      >
        <List
          ref={listRef}
          height={listHeight}
          itemCount={flights.length + (hasMore || isLoadingMore ? 1 : 0)}
          itemSize={(index) => {
            if (index >= flights.length) return 60; // Height for loading indicator
            const size = getItemSize(index);
            return size;
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
