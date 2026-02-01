# SkyRoute ✈️

A modern flight search application built with React, TypeScript, and the Amadeus API. Find the best flights with real-time filtering, price trends, and smart sorting options.

## Features

### 🎯 Core Functionality
- **Real-time Flight Search** - Search flights with instant results
- **Airport Autocomplete** - Smart airport search with IATA code support
- **One-way & Round-trip** - Support for both trip types
- **Price Trends** - Visualize price changes throughout the day with animated charts
- **Smart Filtering** - Filter by stops, airlines, and price range
- **Multiple Sort Options** - Sort by price, duration, or best value

### ✨ User Experience
- **Best/Cheapest/Fastest Badges** - Quickly identify the best options
- **Active Filter Chips** - See and remove active filters at a glance
- **Sticky Search Summary** - Always see your search route and dates
- **Skeleton Loading** - Smooth loading states while fetching results
- **Virtualized List** - Efficient rendering of large result sets with react-window
- **Infinite Scroll** - Automatically load more results as you scroll (10 items per page)
- **Mobile Responsive** - Expandable flight details on mobile devices
- **Dark Mode** - Toggle between light and dark themes with persistence
- **Keyboard Shortcuts** - Press Enter to search, Esc to close drawers
- **Auto-scroll** - Automatically scroll to results when search completes
- **Smart Suggestions** - Helpful suggestions when no results are found
- **Search Persistence** - Your last search is saved and restored

### 🎨 Design
- Modern Material-UI design system
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Accessible components with proper ARIA labels
- Beautiful flight cards with clear visual hierarchy

## Tech Stack

### Frontend (`web/`)
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching with pagination support
- **Recharts** - Chart visualizations with animations
- **react-window** - Virtualization for efficient list rendering

### Backend (`server/`)
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Amadeus API** - Flight data provider

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

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   AMADEUS_CLIENT_ID=your_client_id
   AMADEUS_CLIENT_SECRET=your_client_secret
   AMADEUS_BASE_URL=https://test.api.amadeus.com
   MOCK_MODE=0
   ```

   For testing without API credentials, set `MOCK_MODE=1`

4. **Set up the frontend**
   ```bash
   cd ../web
   npm install
   ```

5. **Configure frontend environment**
   
   Create a `.env` file in the `web/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:3001`

2. **Start the frontend dev server**
   ```bash
   cd web
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Building for Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd web
npm run build
```
The production build will be in `web/dist/`

## Project Structure

```
skyroute/
├── server/                 # Backend API server
│   ├── src/
│   │   ├── index.ts      # Express server setup
│   │   └── amadeus.ts     # Amadeus API integration
│   └── package.json
│
├── web/                    # Frontend React application
│   ├── src/
│   │   ├── app/           # Redux store and hooks
│   │   ├── components/    # Shared components
│   │   ├── features/      # Feature modules
│   │   │   ├── flights/   # Flight search and display
│   │   │   │   ├── components/
│   │   │   │   │   ├── VirtualizedFlightList.tsx  # Virtualized list with infinite scroll
│   │   │   │   │   └── ...
│   │   │   │   └── hooks/
│   │   │   │       └── useInfiniteFlights.ts  # Infinite scroll hook
│   │   │   └── search/    # Search form and state
│   │   └── theme/         # Theme configuration
│   └── package.json
│
└── README.md
```

## Key Features Explained

### Search & Filtering
- **Auto-search**: Searches automatically as you type (debounced)
- **Smart Filters**: Price range, stops, and airline filters work together
- **Filter Chips**: See all active filters and remove them easily

### Sorting Options
- **Price**: Lowest price first
- **Duration**: Shortest flight time first
- **Best Value**: Balances price (60%) and duration (40%) for optimal results

### Price Trends
- Visualizes price changes by departure hour
- Shows min, median, and max prices
- Provides insights like "Prices drop 15% by end of day"
- Animated charts with smooth transitions

### Badges
- **Cheapest**: Lowest price in results
- **Fastest**: Shortest duration in results
- **Best**: Both cheapest and fastest

### Performance Optimizations
- **Virtualization**: Only renders visible flight cards using react-window
- **Infinite Scroll**: Loads 10 flights at a time as you scroll
- **Pagination**: Efficient data loading with RTK Query
- **Memoization**: Optimized selectors and components

## Environment Variables

### Server
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)
- `AMADEUS_CLIENT_ID` - Your Amadeus API client ID
- `AMADEUS_CLIENT_SECRET` - Your Amadeus API client secret
- `AMADEUS_BASE_URL` - Amadeus API base URL (default: test API)
- `MOCK_MODE` - Use mock data instead of API (1 = enabled, 0 = disabled)

### Web
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3001)

## Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Human-readable comments throughout

### State Management
- Redux Toolkit for global state
- RTK Query for server state and caching
- Local storage for search persistence
- Pagination support with infinite scroll

### Styling
- Material-UI components
- Emotion for CSS-in-JS
- Responsive design with breakpoints
- Dark mode support

## API Endpoints

### Backend (`/api/`)
- `GET /health` - Health check endpoint
- `GET /api/airports?q=<query>` - Airport autocomplete
- `GET /api/flights/search?origin=<code>&destination=<code>&departDate=<date>&returnDate=<date>` - Flight search

## Performance

The application uses several performance optimizations:
- **Virtualization**: Only renders visible items in the flight list
- **Pagination**: Loads 10 flights per page
- **Infinite Scroll**: Automatically loads more as you scroll
- **Memoization**: Cached selectors and components
- **Debouncing**: Search requests are debounced to reduce API calls

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
