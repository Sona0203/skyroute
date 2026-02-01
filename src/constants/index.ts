// Shared constants across the application

// Pagination
export const PAGE_SIZE = 10;

// Mobile breakpoints
export const MOBILE_BREAKPOINT = "md" as const;
export const MOBILE_BREAKPOINT_SM = "sm" as const;

// Debounce timings
export const AUTO_SEARCH_DEBOUNCE_MS = 350;
export const AIRPORT_AUTOCOMPLETE_DEBOUNCE_MS = 500; // Increased to reduce API calls and avoid rate limits

// Virtualization constants
export const BASE_ITEM_HEIGHT = 200; // Base height for one-way flights (desktop) - reduced for smaller cards
export const BASE_ITEM_HEIGHT_MOBILE = 450; // Base height for one-way flights (mobile) - reduced for smaller cards
export const RETURN_FLIGHT_EXTRA_HEIGHT = 150; // Extra height for return flight - reduced
export const RETURN_FLIGHT_EXTRA_HEIGHT_MOBILE = 350; // Extra height for return flight (mobile) - reduced
export const CARD_SPACING_DESKTOP = 0; // Spacing between cards (desktop) - no spacing
export const CARD_SPACING_MOBILE = 1; // Spacing between cards (mobile) - minimal spacing
