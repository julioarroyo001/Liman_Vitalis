# UrbanSense AI - Smart Life Monitor

A comprehensive urban monitoring system designed for the NASA Space Apps Challenge 2025. Monitor, visualize, and analyze quality of life in cities through interactive geospatial layers, AI-powered insights, and citizen reporting.

## Overview

UrbanSense AI is a production-ready web application that empowers cities to:
- Monitor environmental and urban quality metrics in real-time
- Enable citizens to report urban issues with AI-assisted classification
- Analyze patterns and predict trends using machine learning
- Visualize data through interactive maps and comprehensive dashboards
- Generate automated alerts for critical situations

## Features

### 1. Interactive Map System
- Dynamic Mapbox-powered visualization
- Multi-layer support with customizable parameters
- Real-time issue markers with priority-based coloring
- Click-to-report functionality
- Layer visibility controls and opacity adjustment

### 2. AI Analysis Engine
- Automatic issue priority classification
- Anomaly detection in environmental data
- Trend analysis and forecasting
- Pattern recognition for issue hotspots
- Confidence scoring for all predictions

### 3. Issue Reporting & Tracking
- Citizen-powered reporting system
- AI-assisted categorization
- Status tracking (reported → in progress → resolved)
- Geographic clustering and hotspot identification
- Community voting system

### 4. Analytics Dashboard
- Real-time statistics and KPIs
- Interactive charts (trends, categories, priorities)
- AI-generated insights and recommendations
- Hotspot visualization
- Export capabilities for reports

### 5. Layer Management
- Create custom data layers
- Support for multiple environmental metrics:
  - Air pollution
  - Traffic congestion
  - Noise levels
  - Temperature and humidity
  - Water quality
  - Green spaces
- Color-coded visualization
- Opacity and visibility controls

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Mapbox GL JS** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication

### AI & Analysis
- Custom JavaScript AI algorithms
- Linear regression for predictions
- Statistical anomaly detection
- Pattern recognition algorithms
- Clustering for hotspot identification

## Database Schema

### Core Tables
- **profiles** - User accounts and roles
- **layers** - Map layer definitions
- **layer_parameters** - Layer configuration
- **layer_data** - Time-series environmental data
- **issues** - Citizen-reported problems
- **ai_predictions** - ML model outputs
- **alerts** - Automated notifications

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (database already configured)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd urbansense-ai
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

4. Database migrations have been applied automatically

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## User Roles

### Citizen
- Report urban issues
- View public data layers
- Access analytics dashboard

### Analyst
- All citizen permissions
- Create and manage data layers
- Access detailed AI insights

### Admin
- All analyst permissions
- Manage users and permissions
- System configuration

## AI Capabilities

### Issue Classification
The AI automatically analyzes issue descriptions to:
- Assign priority levels (low, medium, high, critical)
- Categorize issues appropriately
- Provide confidence scores

### Anomaly Detection
Monitors layer data to identify:
- Statistical outliers (>3σ from mean)
- Sudden spikes or drops
- Geographic anomalies

### Trend Analysis
Analyzes historical data to:
- Detect improving or declining conditions
- Calculate percentage changes
- Generate forecasts

### Pattern Recognition
Identifies:
- Issue hotspots (geographic clustering)
- Category trends
- Temporal patterns

## Security

### Authentication
- Email/password authentication via Supabase
- Secure session management
- Password requirements enforced

### Data Access
- Row Level Security (RLS) policies on all tables
- Users can only modify their own data
- Read access controlled by role
- Sensitive data protected

### Best Practices
- Environment variables for secrets
- No credentials in source code
- Secure API endpoints
- XSS protection via React

## API Integration

The system is designed to integrate with:
- NASA Earth Observation data
- OpenWeatherMap API
- Air quality APIs (AirNow, AQICN)
- Traffic data services
- Municipal open data portals

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
Compatible with:
- Netlify
- AWS Amplify
- Google Cloud Platform
- Azure Static Web Apps

## Performance

- Optimized bundle size
- Lazy loading for routes
- Database indexing on frequent queries
- Real-time updates via WebSocket
- Efficient map rendering

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This project was developed for the NASA Space Apps Challenge 2025.

## Roadmap

Future enhancements:
- Mobile app (React Native/Expo)
- Multilingual support (Spanish/English)
- Advanced ML models (TensorFlow.js)
- Satellite imagery integration
- Predictive maintenance
- API for third-party integrations
- Export to GeoJSON/CSV
- Social features (comments, shares)

## License

MIT License - see LICENSE file

## Support

For questions or issues:
- Create an issue in the repository
- Contact: support@urbansense.ai
- Documentation: https://docs.urbansense.ai

## Acknowledgments

- NASA Space Apps Challenge 2025
- Supabase for backend infrastructure
- Mapbox for mapping technology
- Open source community

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

Transform cities through data-driven insights and community engagement.
