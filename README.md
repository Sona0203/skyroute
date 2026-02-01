# SkyRoute ✈️

A modern flight search application built with React, TypeScript, and the Amadeus API. Find the best flights with real-time filtering, price trends, and smart sorting options.

## Features

### 🎯 Core Functionality
- **Flight Search** - Search flights with manual search button
- **Airport Autocomplete** - Smart airport search with IATA code support and debounced API calls
- **One-way & Round-trip** - Support for both trip types with tab selection
- **Date Selection** - MUI DatePicker with dd/MM/yyyy format and date disabling for dates with no flights
- **Travelers Count** - Select number of travelers (1-9) with price per person display
- **Price Trends** - Visualize price changes throughout the day with animated charts
- **Smart Filtering** - Filter by stops, airlines, and price range
- **Multiple Sort Options** - Sort by price, duration, or best value
- **Infinite Scroll** - Load more flights as you scroll with pagination

### ✨ User Experience
- **Best/Cheapest/Fastest Badges** - Quickly identify the best options based on filtered results
- **Active Filter Chips** - See and remove active filters at a glance
- **Sticky Search Summary** - Always see your search route, dates, and flight count
- **Skeleton Loading** - Smooth loading states while fetching results
- **Mobile Responsive** - Fully responsive design with mobile-optimized layouts
- **Dark Mode** - Toggle between light and dark themes with persistence
- **Keyboard Shortcuts** - Press Enter to search, Esc to close drawers
- **Auto-scroll** - Automatically scroll to results when search completes
- **Smart Suggestions** - Helpful suggestions when no results are found
- **Search Persistence** - Your last search is saved and restored (including trip type and travelers)
- **Price per Person** - Shows price per person when multiple travelers are selected
- **Date Disabling** - Dates with no available flights are automatically disabled in the date picker

### 🎨 Design
- Modern Material-UI design system
- Compact, close-together flight cards with rounded corners
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Accessible components with proper ARIA labels
- Kayak-inspired search form design

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **MUI X Date Pickers** - Date selection with date-fns adapter
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching with pagination
- **Recharts** - Chart visualizations
- **date-fns** - Date manipulation and formatting

### API Integration
- **Amadeus API** - Direct integration from frontend (OAuth token management handled client-side)
- **Rate Limiting** - Automatic retry with exponential backoff for 429 errors
- **Error Handling** - Graceful error handling with user-friendly messages
- **Keyword Sanitization** - Cleans special characters from airport search queries

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Amadeus API credentials (Client ID and Client Secret)
  - Sign up at [Amadeus for Developers](https://developers.amadeus.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skyroute
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the project root:
   ```env
   VITE_AMADEUS_CLIENT_ID=your_client_id
   VITE_AMADEUS_CLIENT_SECRET=your_client_secret
   VITE_AMADEUS_BASE_URL=https://test.api.amadeus.com
   ```

   **Note**: For production, consider using environment variables or a backend proxy to keep credentials secure. For development and testing, this setup works fine.

### Running the Application

**Start the dev server**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

The application calls the Amadeus API directly from the browser. Make sure you have your Amadeus credentials configured in the `.env` file.

### Building for Production

```bash
npm run build
```
The production build will be in `dist/`

**Security Note**: In production, consider using a backend proxy to keep API credentials secure. For development, direct API calls work fine.

## Project Structure

```
skyroute/
├── src/
│   ├── app/               # Redux store and hooks
│   │   ├── hooks.ts       # Custom hooks (useMobile, useAppSelector, etc.)
│   │   └── store.ts       # Redux store configuration
│   ├── components/        # Shared components
│   │   ├── AppShell.tsx  # Main app layout
│   │   ├── Header.tsx    # Header with logo and theme switcher
│   │   └── states/       # Empty and error states
│   ├── features/          # Feature modules
│   │   ├── flights/       # Flight search and display
│   │   │   ├── components/
│   │   │   │   ├── VirtualizedFlightList.tsx  # Direct rendering with infinite scroll
│   │   │   │   ├── FlightCard.tsx            # Individual flight card
│   │   │   │   ├── FiltersPanel.tsx          # Filter sidebar/drawer
│   │   │   │   ├── ActiveFilters.tsx         # Active filter chips
│   │   │   │   ├── PriceChart.tsx            # Price trend visualization
│   │   │   │   ├── SearchSummaryBar.tsx      # Sticky search summary
│   │   │   │   └── ResultsLayout.tsx          # Main results layout
│   │   │   ├── hooks/
│   │   │   │   └── useInfiniteFlights.ts     # Infinite scroll hook with RTK Query
│   │   │   ├── flightsApi.ts                 # RTK Query API definition
│   │   │   ├── selectors.ts                  # Memoized selectors
│   │   │   ├── types.ts                      # TypeScript types
│   │   │   └── utils.ts                     # Utility functions (badges, duration, etc.)
│   │   └── search/        # Search form and state
│   │       ├── components/
│   │       │   ├── SearchForm.tsx            # Main search form with tabs
│   │       │   └── AirportAutocomplete.tsx  # Airport autocomplete component
│   │       ├── searchSlice.ts               # Redux slice for search state
│   │       └── types.ts                     # Search-related types
│   ├── services/          # External API services
│   │   └── amadeus.ts     # Amadeus API client with OAuth and error handling
│   ├── theme/             # Theme configuration
│   │   ├── theme.ts       # MUI theme configuration
│   │   └── ThemeContext.tsx # Theme provider and context
│   └── constants/         # Shared constants
│       └── index.ts       # Constants (PAGE_SIZE, debounce timings, etc.)
├── public/                 # Static assets
├── package.json
└── README.md
```

## Key Features Explained

### Search Form
- **Trip Type Tabs**: Switch between one-way and round-trip
- **Airport Autocomplete**: Debounced search (500ms) with IATA code support
- **Date Pickers**: MUI DatePicker with dd/MM/yyyy format, click-to-open, and date disabling
- **Travelers Field**: Number input (1-9) with validation
- **Search Button**: Manual search trigger (no auto-search)
- **Route Swap**: Swap origin and destination with one click

### Search & Filtering
- **Manual Search**: Search only triggers when clicking the search button or pressing Enter
- **Smart Filters**: Price range, stops, and airline filters work together
- **Filter Chips**: See all active filters and remove them easily
- **Date Disabling**: Dates that returned no flights are automatically disabled

### Sorting Options
- **Price**: Lowest price first
- **Duration**: Shortest flight time first
- **Best Value**: Balances price (60%) and duration (40%) for optimal results

### Price Display
- **Total Price**: Shows total price for all travelers
- **Price per Person**: Automatically displayed when travelers > 1
- **Currency**: Displays in the currency returned by the API (default: EUR)

### Price Trends
- Visualizes price changes by departure hour
- Shows min, median, and max prices
- Provides insights like "Prices drop 15% by end of day"

### Badges
- **Cheapest**: Lowest price in filtered results
- **Fastest**: Shortest duration in filtered results
- **Best**: Both cheapest and fastest (replaces individual badges)

### Infinite Scroll
- Loads 10 flights per page
- Automatically loads more when scrolling near bottom
- Shows loading indicator while fetching
- Uses RTK Query for efficient caching and data management

### Error Handling
- **Rate Limiting**: Automatic retry with exponential backoff for 429 errors
- **Bad Requests**: User-friendly error messages for 400 errors
- **Keyword Sanitization**: Cleans special characters from search queries
- **Debouncing**: Reduces API calls for airport autocomplete

## Environment Variables

### `.env` file in project root
- `VITE_AMADEUS_CLIENT_ID` - Your Amadeus API client ID (required)
- `VITE_AMADEUS_CLIENT_SECRET` - Your Amadeus API client secret (required)
- `VITE_AMADEUS_BASE_URL` - Amadeus API base URL (default: https://test.api.amadeus.com)

**Security Note**: These credentials will be visible in the browser. For production applications, consider using a backend proxy to keep credentials secure.

## Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Human-readable comments throughout

### State Management
- Redux Toolkit for global state
- RTK Query for server state and caching
- Local storage for search persistence (trip type, travelers, dates, filters)

### Styling
- Material-UI components
- Emotion for CSS-in-JS
- Responsive design with breakpoints
- Dark mode support with persistence

### Performance
- Direct rendering (no virtualization) for simpler code
- Infinite scroll with pagination (10 items per page)
- Memoized selectors for efficient state derivation
- Debounced API calls for airport autocomplete

## API Integration

The application directly calls the Amadeus API:

- **Airport Autocomplete**: `/v1/reference-data/locations` - Search for airports and cities
  - Debounced by 500ms
  - Keyword sanitization (removes special characters)
  - Retry logic for rate limits

- **Flight Search**: `/v2/shopping/flight-offers` - Search for flight offers
  - Supports one-way and round-trip
  - Supports travelers count (adults parameter)
  - Returns up to 50 results per request
  - Paginated with 10 items per page

OAuth token management is handled automatically by the frontend service layer with token caching.

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License
This project is private and proprietary.

## Contributing
This is a private project. For questions or issues, please contact the maintainers.

---

Built with ❤️ using React, TypeScript, and the Amadeus API
