// Shared constants across the application

// Pagination
export const PAGE_SIZE = 10;

// Mobile breakpoints
export const MOBILE_BREAKPOINT = "md" as const;
export const MOBILE_BREAKPOINT_SM = "sm" as const;

// Debounce timings
export const AUTO_SEARCH_DEBOUNCE_MS = 350;
export const AIRPORT_AUTOCOMPLETE_DEBOUNCE_MS = 250;

// Virtualization constants
export const BASE_ITEM_HEIGHT = 240; // Base height for one-way flights (desktop)
export const BASE_ITEM_HEIGHT_MOBILE = 550; // Base height for one-way flights (mobile)
export const RETURN_FLIGHT_EXTRA_HEIGHT = 180; // Extra height for return flight
export const RETURN_FLIGHT_EXTRA_HEIGHT_MOBILE = 450; // Extra height for return flight (mobile)
export const CARD_SPACING_DESKTOP = 4; // Spacing between cards (desktop) - minimal spacing
export const CARD_SPACING_MOBILE = 8; // Spacing between cards (mobile) - minimal spacing
