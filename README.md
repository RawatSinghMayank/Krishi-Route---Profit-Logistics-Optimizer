# Krishi-Route Dashboard - Frontend

## Overview
Professional React dashboard for the Krishi-Route Profit & Logistics Optimizer. This is the frontend UI that allows farmers to compare APMC mandi prices, calculate transport costs, and find the most profitable market for their crops.

## Features Implemented

### ✅ Core Components
1. **Dashboard** - Main container orchestrating all components
2. **InputForm** - Capture trip details (crop, quantity, vehicle, location)
3. **ProfitCards** - Side-by-side market comparison with profit metrics
4. **RouteMap** - Interactive Leaflet map with route visualization
5. **CostBreakdown** - Recharts visualization (bar chart + pie chart)
6. **ImpactMetrics** - Hero section showing potential savings and insights

### ✅ Key Features
- 🌾 6 crop types with bilingual labels (English + Hindi)
- 🚛 3 vehicle types with capacity and rates per km
- 📍 Geolocation support for detecting farmer's location
- 💰 Real-time profit calculation and comparison
- 🗺️ Interactive map with custom markers and route lines
- 📊 Multiple chart views (comparison bar chart + cost distribution pie chart)
- 📈 Smart insights (price alerts, perishability warnings, historical trends)
- 📱 Fully responsive design

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Backend API running (or use mock data for development)

### Step 1: Install Dependencies
```bash
cd krishi-route-dashboard
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### Step 3: Build for Production
```bash
npm run build
```

## API Integration

The dashboard expects a POST endpoint at `/api/calculate-profit` with the following request/response format:

### Request Format
```json
{
  "crop": "onion",
  "quantity": "5",
  "unit": "quintal",
  "vehicle": "tata_ace",
  "location": {
    "name": "Nashik",
    "lat": 19.9975,
    "lng": 73.7898
  }
}
```

### Response Format
```json
{
  "mandis": [
    {
      "id": "mandi_001",
      "name": "Lasalgaon APMC",
      "district": "Nashik",
      "location": {
        "lat": 20.1406,
        "lng": 74.2397
      },
      "distance": 45.2,
      "marketPrice": 2500,
      "revenue": 12500,
      "costs": {
        "transport": 542,
        "handling": 500,
        "other": 100
      },
      "netProfit": 11358,
      "priceAlert": {
        "trend": "rising",
        "change": "5.2"
      },
      "perishabilityWarning": null,
      "historicalInsight": "This mandi typically offers 8% higher prices on Wednesdays"
    }
  ],
  "bestMandi": {
    "id": "mandi_001",
    "name": "Lasalgaon APMC"
  }
}
```

## Mock Data for Testing

If you want to test the dashboard without a backend, replace the API call in `Dashboard.jsx` with this mock response:

```javascript
const handleTripSubmit = async (formData) => {
  setLoading(true);
  setError(null);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock data
  const mockData = {
    mandis: [
      {
        id: "mandi_001",
        name: "Lasalgaon APMC",
        district: "Nashik",
        location: { lat: 20.1406, lng: 74.2397 },
        distance: 45.2,
        marketPrice: 2500,
        revenue: 12500,
        costs: { transport: 542, handling: 500, other: 0 },
        netProfit: 11458,
        priceAlert: { trend: "rising", change: "5.2" },
        historicalInsight: "This mandi typically offers 8% higher prices on Wednesdays"
      },
      {
        id: "mandi_002",
        name: "Pimpalgaon APMC",
        district: "Nashik",
        location: { lat: 19.9500, lng: 74.1500 },
        distance: 12.5,
        marketPrice: 2200,
        revenue: 11000,
        costs: { transport: 150, handling: 500, other: 0 },
        netProfit: 10350,
      },
      {
        id: "mandi_003",
        name: "Yeola APMC",
        district: "Nashik",
        location: { lat: 20.0425, lng: 74.4894 },
        distance: 65.8,
        marketPrice: 2600,
        revenue: 13000,
        costs: { transport: 790, handling: 500, other: 100 },
        netProfit: 11610,
        perishabilityWarning: { message: "Long journey - ensure proper storage for perishables" }
      }
    ],
    bestMandi: { id: "mandi_003", name: "Yeola APMC" }
  };
  
  setTripData(formData);
  setProfitResults(mockData);
  setLoading(false);
};
```

## Customization Guide

### Adding New Crops
Edit `src/components/InputForm.jsx`:
```javascript
const CROPS = [
  { value: 'mango', label: 'Mango (आम)' },
  // Add more crops here
];
```

### Adding New Vehicles
Edit `src/components/InputForm.jsx`:
```javascript
const VEHICLES = [
  { 
    value: 'large_truck', 
    label: 'Large Truck', 
    capacity: '10 tons',
    ratePerKm: 30,
  },
  // Add more vehicles here
];
```

### Changing Color Theme
Edit color variables in component CSS files:
- Primary green: `#2e7d32` → Your color
- Secondary green: `#66bb6a` → Your color
- Background: `#f5f7fa` → Your color

## Component Props Reference

### Dashboard
No props - manages all state internally.

### InputForm
```typescript
{
  onSubmit: (formData) => void;
  loading: boolean;
  onReset: () => void;
  hasResults: boolean;
}
```

### ProfitCards
```typescript
{
  results: Mandi[];
  selectedCrop: string;
}
```

### RouteMap
```typescript
{
  origin: { name: string; lat: number; lng: number };
  mandis: Mandi[];
  bestMandi: { id: string; name: string };
}
```

### CostBreakdown
```typescript
{
  mandis: Mandi[];
}
```

### ImpactMetrics
```typescript
{
  results: { mandis: Mandi[]; bestMandi: any };
  tripData: FormData;
}
```

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations
- React.memo() for expensive components (add if needed)
- Lazy loading for maps and charts (implement with React.lazy)
- Image optimization for crop icons
- Code splitting for production builds

## Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Drag /build folder to Netlify
```

### Custom Server
```bash
npm run build
# Serve /build folder with nginx or Apache
```

## Troubleshooting

### Map not displaying?
- Check Leaflet CSS is imported in RouteMap.jsx
- Verify map container has defined height in CSS
- Check browser console for errors

### Charts not rendering?
- Verify Recharts is installed: `npm install recharts`
- Check data format matches expected structure
- Ensure ResponsiveContainer has parent with defined width

### API calls failing?
- Check backend is running
- Verify API endpoint URL
- Check CORS settings on backend
- Use browser DevTools Network tab to debug

## Next Steps for Production

1. **Environment Variables**: Create `.env` for API URLs
2. **Error Boundary**: Add React error boundaries
3. **Loading States**: Add skeleton loaders
4. **Caching**: Implement React Query for API caching
5. **Analytics**: Add Google Analytics or Mixpanel
6. **PWA**: Add service worker for offline support
7. **i18n**: Add react-i18next for multilingual support
8. **Testing**: Add Jest + React Testing Library tests

## License
MIT

## Support
For issues or questions, please open a GitHub issue or contact the development team.
