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

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **Recharts** - Chart visualizations

### API Integration
- **Amadeus API** - Direct integration from frontend (OAuth token management handled client-side)

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
│   ├── components/        # Shared components
│   ├── features/          # Feature modules
│   │   ├── flights/       # Flight search and display
│   │   │   ├── components/
│   │   │   │   ├── VirtualizedFlightList.tsx  # Virtualized list with infinite scroll
│   │   │   │   └── ...
│   │   │   └── hooks/
│   │   │       └── useInfiniteFlights.ts  # Infinite scroll hook
│   │   └── search/        # Search form and state
│   ├── services/          # External API services
│   │   └── amadeus.ts     # Amadeus API client
│   └── theme/             # Theme configuration
├── public/                 # Static assets
├── package.json
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

### Badges
- **Cheapest**: Lowest price in results
- **Fastest**: Shortest duration in results
- **Best**: Both cheapest and fastest

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
- Local storage for search persistence

### Styling
- Material-UI components
- Emotion for CSS-in-JS
- Responsive design with breakpoints
- Dark mode support

## API Integration

The application directly calls the Amadeus API:

- **Airport Autocomplete**: `/v1/reference-data/locations` - Search for airports and cities
- **Flight Search**: `/v2/shopping/flight-offers` - Search for flight offers

OAuth token management is handled automatically by the frontend service layer.

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
