# SkyRoute - Loom Demo Script (3-4 minutes)

## Full Script to Read

---

### Introduction (20 seconds)

"Hi! I'm going to walk you through SkyRoute, a modern flight search application I built using React, TypeScript, and the Amadeus API. I'll show you the key features and explain the technical decisions I made along the way."

---

### Part 1: Core Features (50 seconds)

"Let me start by showing you the search form. SkyRoute supports both one-way and round-trip searches. The airport autocomplete uses IATA codes and debounces API calls to prevent rate limiting. Notice the date pickers - they automatically disable dates that have no available flights, which helps prevent users from selecting dates with no results. The travelers field accepts manual input travelers, and when multiple travelers are selected, the app shows both total price and price per person on each flight card. I chose a manual search button instead of auto-search so users have full control over when to trigger the search, and they can also press Enter to search."

---

### Part 2: Technical Architecture (50 seconds)

"For state management, I chose Redux Toolkit with RTK Query. Redux Toolkit handles all search parameters, filters, and sort options, and it makes it easy to persist the search state to localStorage so users don't lose their search when they refresh the page. RTK Query handles all API calls with built-in caching, automatic request deduplication, and pagination support. It also manages loading and error states automatically, which keeps my code clean. I integrated directly with the Amadeus API from the frontend, which required careful OAuth token management. I implemented token caching with expiration tracking and a 10-second buffer to prevent race conditions. The airport autocomplete is debounced by 500 milliseconds to reduce API calls and avoid hitting rate limits."

---

### Part 3: User Experience Features (60 seconds)

"One of my favorite features is the smart date picker. When a search returns no flights for a specific date, that date automatically gets marked in the Redux state and disabled in the picker. This prevents users from selecting dates that won't have results, saving them time and frustration. The feature works for both departure and return dates, and it persists across searches so users don't accidentally try the same unavailable dates again. It's hard to demonstrate this live since most dates usually have flights available, but the feature is fully implemented and working in the background. For the travelers input, I used a text input with a numeric keyboard instead of a number input. This uses local state for free typing and syncs to Redux when the user finishes editing. This approach ensures it works consistently across all browsers and devices, especially on mobile. When multiple travelers are selected, you can see the price breakdown on each flight card showing both the total and per-person price."

---

### Part 4: Filtering and Sorting (50 seconds)

"The filtering system is designed to work intelligently together. You can filter by stops - direct flights, one stop, or two or more stops. There's a price range filter with min and max sliders, and you can filter by airlines with multi-select. Active filter chips show what's currently applied, and there's a clear all button when multiple filters are active. The filters are applied in a specific order - price first, then stops, then airlines. The airline filter is applied last so the airline counts update dynamically as you change price or stops, giving users real-time feedback. For sorting, there are three options: lowest price, shortest duration, and best value, which balances price at 60% and duration at 40%. Flight cards show badges for the best options - cheapest for the lowest price, fastest for shortest duration, and best if it's both cheapest and fastest."

---

### Part 5: Performance and Polish (40 seconds)

"I implemented infinite scroll that loads 10 flights per page and automatically loads more when you scroll near the bottom. It shows a loading indicator while fetching and uses RTK Query caching for efficient data management. The entire app is fully responsive with mobile-optimized layouts, touch-friendly interactions, drawer-based filters on mobile, and sidebar filters on desktop. For loading states, I use skeleton loading cards that show the structure while data loads, which provides a much better experience than blank screens or spinners."

---

### Part 6: Challenges and Solutions (30 seconds)

"I faced a few interesting challenges. First, the Amadeus API has rate limits, so I implemented exponential backoff retry with 1, 2, and 4 second delays, increased the debounce time to 500 milliseconds, and added user-friendly error messages. Second, number inputs can be unreliable on mobile, so I used a text input with a numeric keyboard, local state for free typing, and sync to Redux on blur, which ensures consistent behavior across all devices. Third, preventing users from selecting dates with no flights required tracking dates that returned no results, storing them in Redux state, and integrating with MUI DatePicker's shouldDisableDate prop."

---

### Conclusion (20 seconds)

"SkyRoute demonstrates modern React development with TypeScript, Redux Toolkit, and Material-UI. The app prioritizes user experience with intelligent features like date disabling, smart filtering, and responsive design. All code is well-structured, type-safe, and production-ready. Thank you for watching!"

---

## Quick Reference - What to Show

1. **Search form** - Show all fields
2. **Airport autocomplete** - Type and show suggestions
3. **Date pickers** - Show them opening
4. **Travelers input** - Type a number
5. **Search button** - Click to search
6. **Flight results** - Show cards with badges
7. **Filters** - Apply stops, price, airlines
8. **Active filter chips** - Point them out
9. **Sort options** - Switch between them
10. **Price per person** - If multiple travelers
11. **Infinite scroll** - Scroll to load more
12. **Date disabling** - Mention the feature (optional - only if you find unavailable dates)
13. **Loading states** - Trigger a search

---

## Tips

- Speak at a moderate pace
- Pause briefly when showing UI interactions
- Have test routes ready (e.g., NYC to Paris)
- Keep it conversational and natural
