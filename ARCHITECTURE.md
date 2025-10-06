# UrbanSense AI - Technical Architecture

Comprehensive technical documentation for developers and system architects.

## System Overview

UrbanSense AI is a modern, cloud-native web application built on a serverless architecture using Supabase as the backend platform.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React + TypeScript + Vite + TailwindCSS + Mapbox          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS/WSS
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     Supabase Platform                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ Auth Service │  │  Realtime    │     │
│  │   Database   │  │     JWT      │  │  WebSocket   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
                      │
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      AI Analysis Layer                       │
│         Client-side ML algorithms & Statistics              │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure

```
src/
├── components/           # React components
│   ├── Auth.tsx         # Authentication UI
│   ├── Map.tsx          # Mapbox integration
│   ├── Dashboard.tsx    # Analytics dashboard
│   ├── Sidebar.tsx      # Navigation
│   ├── LayersPanel.tsx  # Layer management
│   ├── IssuesPanel.tsx  # Issue tracking
│   └── IssueReportModal.tsx  # Report form
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Auth state management
├── lib/                 # Utilities & services
│   ├── supabase.ts     # Database client
│   └── ai-analysis.ts  # AI/ML algorithms
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

### State Management

**Authentication State**
- Managed via React Context API
- Session persistence through Supabase
- Auto-refresh tokens

**Application State**
- Component-level state with useState
- Real-time sync via Supabase subscriptions
- No global state library needed (lightweight app)

**Map State**
- Mapbox GL manages map state
- Layer visibility in component state
- Markers dynamically created/destroyed

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Supabase Client Call
    ↓
Database Operation
    ↓
Real-time Subscription Fires
    ↓
Component State Updates
    ↓
UI Re-renders
```

## Database Architecture

### Schema Design

**Core Entities:**
1. **profiles** - User information and roles
2. **layers** - Map layer definitions
3. **layer_data** - Time-series measurements
4. **issues** - Citizen reports
5. **ai_predictions** - ML model outputs
6. **alerts** - System notifications

**Relationships:**
- One-to-Many: User → Layers
- One-to-Many: Layer → LayerData
- One-to-Many: User → Issues
- Many-to-One: Issues → Alerts
- Many-to-One: Layers → Alerts

### Indexing Strategy

**Performance Indexes:**
```sql
-- Frequently filtered columns
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_category ON issues(category);

-- Geographic queries
CREATE INDEX idx_issues_location ON issues(latitude, longitude);
CREATE INDEX idx_layer_data_location ON layer_data(latitude, longitude);

-- Time-based queries
CREATE INDEX idx_layer_data_recorded_at ON layer_data(recorded_at);

-- Foreign keys
CREATE INDEX idx_layers_user_id ON layers(user_id);
CREATE INDEX idx_layer_data_layer_id ON layer_data(layer_id);
```

### Row Level Security (RLS)

**Security Model:**
- All tables have RLS enabled
- Policies enforce user ownership
- Public read for non-sensitive data
- Write operations require authentication

**Example Policy:**
```sql
CREATE POLICY "Users can update own issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## AI/ML Architecture

### Algorithm Overview

**1. Issue Priority Classification**
- Rule-based NLP analysis
- Keyword matching for urgency
- Category-based prioritization
- Confidence scoring

**2. Anomaly Detection**
- Z-score statistical method
- Threshold: 2σ warning, 3σ critical
- Rolling window analysis
- Confidence based on deviation

**3. Trend Analysis**
- Linear regression on time series
- Percentage change calculation
- First-half vs second-half comparison
- Direction classification (improving/declining/stable)

**4. Prediction Engine**
- Simple linear regression
- Least squares fitting
- RMSE for confidence calculation
- Extrapolation for forecasting

**5. Pattern Recognition**
- Grid-based spatial clustering
- Category frequency analysis
- Hotspot identification (≥3 issues in grid)
- Priority weighting

### AI Data Flow

```
Input Data (issues, layer_data)
    ↓
Feature Extraction
    ↓
Algorithm Application
    ↓
Confidence Calculation
    ↓
Result Storage (ai_predictions, alerts)
    ↓
Dashboard Visualization
```

## Authentication & Authorization

### Authentication Flow

```
1. User submits credentials
   ↓
2. Supabase Auth validates
   ↓
3. JWT token issued
   ↓
4. Profile record created/fetched
   ↓
5. Session established
   ↓
6. Token stored in localStorage
   ↓
7. Auto-refresh on expiry
```

### Authorization Levels

**Citizen (Default)**
- Create issues
- View public layers
- Access dashboard

**Analyst**
- All citizen permissions
- Create/edit layers
- Advanced analytics

**Admin**
- All analyst permissions
- User management
- System configuration

### Security Measures

- Password hashing (bcrypt via Supabase)
- JWT token authentication
- HTTPS only in production
- RLS policies on database
- XSS protection via React
- CSRF protection via SameSite cookies

## Real-time Features

### Supabase Realtime

**Subscriptions:**
```typescript
supabase
  .channel('issues_changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'issues' },
    (payload) => {
      // Handle change
    }
  )
  .subscribe();
```

**Events Monitored:**
- INSERT: New issues reported
- UPDATE: Issue status changes
- DELETE: Issues removed

**Benefits:**
- No polling required
- Instant updates across clients
- Reduced server load
- Better UX

## Map Integration

### Mapbox GL JS

**Features Used:**
- Vector tile rendering
- Custom markers
- Popups for issue details
- Navigation controls
- Click events

**Marker System:**
```typescript
const marker = new mapboxgl.Marker(element)
  .setLngLat([lng, lat])
  .setPopup(popup)
  .addTo(map);
```

**Layer Rendering:**
- Markers for issues (DOM elements)
- Future: GeoJSON layers for data
- Heat maps for density visualization
- Cluster groups for performance

## Performance Optimization

### Frontend

**Code Splitting:**
- Route-based splitting (future)
- Component lazy loading
- Dynamic imports for large libraries

**Bundle Optimization:**
- Tree shaking enabled
- Minification in production
- Gzip compression

**Rendering:**
- React.memo for expensive components
- useMemo for calculations
- useCallback for handlers
- Virtual scrolling for long lists

### Database

**Query Optimization:**
- Indexed columns for filtering
- Limit results (typically 100-500)
- Pagination for large datasets
- Eager loading for related data

**Caching:**
- Browser caching for assets
- Service worker (future)
- CDN for static files

## Scalability Considerations

### Current Capacity
- Suitable for cities up to 1M population
- Handles ~10,000 concurrent users
- Processes ~1,000 issues/day
- Stores ~100,000 data points/day

### Horizontal Scaling
- Stateless frontend (CDN)
- Supabase auto-scales
- Add read replicas for heavy reads
- Connection pooling for database

### Vertical Scaling
- Upgrade Supabase plan
- Increase database resources
- Optimize queries and indexes

## Monitoring & Observability

### Metrics to Track
- API response times
- Database query performance
- Error rates and types
- User engagement
- Issue resolution time
- AI prediction accuracy

### Logging
- Frontend errors (console, Sentry)
- Database slow queries
- Authentication failures
- API rate limits

### Health Checks
- Database connectivity
- Authentication service
- Map tile loading
- Real-time connection

## Deployment Architecture

### Production Setup

```
┌─────────────┐
│   Vercel    │ ← Frontend deployment
│   (CDN)     │
└──────┬──────┘
       │
       │ API calls
       │
┌──────▼──────┐
│  Supabase   │ ← Backend services
│  (Cloud)    │
└─────────────┘
```

### CI/CD Pipeline

```
Git Push
    ↓
GitHub Actions
    ↓
Run Tests & Linting
    ↓
Build Application
    ↓
Deploy to Vercel (staging)
    ↓
Smoke Tests
    ↓
Deploy to Production
```

### Environment Variables

**Development:**
- VITE_SUPABASE_URL (local or dev)
- VITE_SUPABASE_ANON_KEY

**Production:**
- VITE_SUPABASE_URL (production)
- VITE_SUPABASE_ANON_KEY (production)

## Security Architecture

### Threat Model

**Threats Mitigated:**
- SQL injection (parameterized queries)
- XSS attacks (React escaping)
- CSRF (SameSite cookies)
- Man-in-the-middle (HTTPS)
- Unauthorized data access (RLS)

**Remaining Risks:**
- DDoS attacks (rate limiting needed)
- Credential stuffing (2FA future)
- Data scraping (API limits needed)

### Data Privacy

- User emails stored securely
- No PII collected unnecessarily
- Issue reports may contain location data
- GDPR compliance considerations
- Data retention policies needed

## API Design

### Supabase Client Usage

**Read Operations:**
```typescript
const { data, error } = await supabase
  .from('issues')
  .select('*')
  .eq('status', 'reported')
  .order('created_at', { ascending: false })
  .limit(100);
```

**Write Operations:**
```typescript
const { data, error } = await supabase
  .from('issues')
  .insert({
    title: 'Issue title',
    description: 'Details',
    latitude: 19.4326,
    longitude: -99.1332,
  });
```

**Real-time:**
```typescript
supabase
  .channel('changes')
  .on('postgres_changes', config, handler)
  .subscribe();
```

## Testing Strategy

### Unit Tests
- AI algorithm accuracy
- Utility functions
- Component logic

### Integration Tests
- Authentication flow
- Database operations
- Real-time updates

### E2E Tests
- User registration
- Issue reporting
- Layer creation
- Dashboard viewing

### Testing Tools
- Vitest for unit tests
- React Testing Library
- Playwright for E2E (future)

## Future Enhancements

### Technical Improvements
1. Progressive Web App (PWA)
2. Offline support with Service Workers
3. Advanced ML models (TensorFlow.js)
4. GraphQL API layer
5. Microservices architecture
6. Redis caching layer
7. Advanced analytics (BigQuery)
8. Mobile apps (React Native)

### Feature Additions
1. Social features (comments, likes)
2. Notification system (push, email)
3. Advanced filtering and search
4. Data export (CSV, GeoJSON, PDF)
5. Satellite imagery overlay
6. Historical playback
7. Predictive maintenance
8. Integration APIs

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint rules enforced
- Prettier for formatting
- Functional components preferred
- Hooks for state management

### Git Workflow
- Feature branches
- Pull request reviews
- Semantic versioning
- Conventional commits

### Documentation
- JSDoc for complex functions
- README for setup
- ARCHITECTURE for design
- API docs for endpoints

## Troubleshooting Guide

### Common Issues

**Build Failures:**
- Clear node_modules, reinstall
- Check Node.js version (18+)
- Verify environment variables

**Database Errors:**
- Check RLS policies
- Verify user authentication
- Review query syntax

**Map Not Loading:**
- Verify Mapbox token
- Check network requests
- Clear browser cache

**Real-time Not Working:**
- Check WebSocket connection
- Verify subscription setup
- Review Supabase status

---

**Document Version:** 1.0
**Last Updated:** 2025-10-04
**Maintained By:** UrbanSense AI Development Team
