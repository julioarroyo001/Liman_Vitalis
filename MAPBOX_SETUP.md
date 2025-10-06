# Mapbox Setup Guide

UrbanSense AI uses Mapbox GL JS for interactive map visualization. Follow these steps to configure Mapbox properly.

## Getting a Mapbox Access Token

### Step 1: Create a Mapbox Account

1. Go to https://account.mapbox.com/auth/signup/
2. Sign up with your email
3. Verify your email address
4. Complete the account setup

### Step 2: Get Your Access Token

1. Log in to https://account.mapbox.com/
2. Navigate to "Access tokens" page
3. Copy your "Default public token"
4. Or create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`

### Step 3: Configure the Application

**Option A: Environment Variable (Recommended)**

1. Add to your `.env` file:
```bash
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHZhODl2ejgwMGN6MmpsZ2o5eXJ5ZXY3In0.your-token-here
```

2. Update `src/components/Map.tsx`:
```typescript
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
```

**Option B: Direct Configuration**

1. Open `src/components/Map.tsx`
2. Replace the placeholder token:
```typescript
mapboxgl.accessToken = 'pk.YOUR_ACTUAL_TOKEN_HERE';
```

### Step 4: Restart Development Server

```bash
npm run dev
```

## Mapbox Free Tier Limits

The free tier includes:
- **50,000 map loads per month**
- Unlimited map views after loaded
- Vector tiles
- Satellite imagery
- All map styles

**Typical Usage:**
- Small city (10,000 residents): ~5,000 loads/month
- Medium city (100,000 residents): ~20,000 loads/month
- Large city (1M residents): May need paid plan

## Map Styles

UrbanSense AI is configured to use the "light-v11" style by default. You can change this in `src/components/Map.tsx`:

### Available Styles

```typescript
// Light theme (default)
style: 'mapbox://styles/mapbox/light-v11'

// Dark theme
style: 'mapbox://styles/mapbox/dark-v11'

// Streets
style: 'mapbox://styles/mapbox/streets-v12'

// Outdoors
style: 'mapbox://styles/mapbox/outdoors-v12'

// Satellite
style: 'mapbox://styles/mapbox/satellite-v9'

// Satellite with streets
style: 'mapbox://styles/mapbox/satellite-streets-v12'
```

### Custom Style

You can create your own style:
1. Go to Mapbox Studio: https://studio.mapbox.com/
2. Create new style
3. Customize colors, fonts, layers
4. Publish style
5. Copy style URL
6. Use in application

## Alternative: OpenStreetMap (Free)

If you prefer not to use Mapbox, you can use Leaflet with OpenStreetMap:

### Install Leaflet

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### Update Map Component

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function Map() {
  return (
    <MapContainer
      center={[19.4326, -99.1332]}
      zoom={11}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Add markers here */}
    </MapContainer>
  );
}
```

**Pros:**
- Completely free
- No API limits
- Open source

**Cons:**
- Less polished than Mapbox
- Fewer features
- May need more customization

## Troubleshooting

### "Unauthorized" Error

**Cause:** Invalid or missing access token

**Solution:**
1. Check token is correctly set
2. Verify token has required scopes
3. Ensure token hasn't expired
4. Try creating a new token

### Map Not Loading

**Cause:** Network issues or token problems

**Solution:**
1. Check browser console for errors
2. Verify internet connection
3. Clear browser cache
4. Check Mapbox service status: https://status.mapbox.com/

### Markers Not Appearing

**Cause:** Coordinates may be outside map bounds

**Solution:**
1. Verify latitude/longitude values
2. Check map center and zoom level
3. Ensure markers are added after map loads
4. Check for JavaScript errors

### Performance Issues

**Cause:** Too many markers or complex data

**Solution:**
1. Implement marker clustering
2. Use GeoJSON layers for data
3. Limit visible markers
4. Use viewport-based filtering

## Advanced Configuration

### Custom Marker Icons

```typescript
const el = document.createElement('div');
el.className = 'custom-marker';
el.style.backgroundImage = 'url(/marker-icon.png)';
el.style.width = '32px';
el.style.height = '32px';

new mapboxgl.Marker(el)
  .setLngLat([lng, lat])
  .addTo(map);
```

### Marker Clustering

For performance with many markers:

```bash
npm install supercluster
```

```typescript
import Supercluster from 'supercluster';

const cluster = new Supercluster({
  radius: 40,
  maxZoom: 16
});

cluster.load(geojsonPoints);
const clusters = cluster.getClusters([-180, -85, 180, 85], zoom);
```

### Heat Maps

For density visualization:

```typescript
map.addSource('issues', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: issuesAsGeoJSON
  }
});

map.addLayer({
  id: 'issues-heat',
  type: 'heatmap',
  source: 'issues',
  paint: {
    'heatmap-weight': ['get', 'priority'],
    'heatmap-intensity': 1,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(0,0,255,0)',
      0.5, 'rgb(0,255,0)',
      1, 'rgb(255,0,0)'
    ],
    'heatmap-radius': 20
  }
});
```

### Geocoding (Address Search)

```bash
npm install @mapbox/mapbox-gl-geocoder
```

```typescript
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
});

map.addControl(geocoder);
```

## Best Practices

1. **Token Security**
   - Never commit tokens to git
   - Use environment variables
   - Restrict token URLs in production
   - Create separate tokens for dev/prod

2. **Performance**
   - Limit visible markers (use clustering)
   - Debounce map move events
   - Use GeoJSON for large datasets
   - Lazy load map component

3. **User Experience**
   - Add loading indicators
   - Handle errors gracefully
   - Provide location search
   - Enable geolocation

4. **Accessibility**
   - Add ARIA labels
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

## Cost Management

### Monitor Usage

Check usage at: https://account.mapbox.com/

### Optimize Costs

1. **Cache Tiles**
   - Use service workers
   - Enable browser caching
   - CDN for static assets

2. **Lazy Loading**
   - Load map only when needed
   - Defer initialization
   - Conditional rendering

3. **Rate Limiting**
   - Throttle map updates
   - Batch marker additions
   - Debounce user actions

### Upgrade When Needed

Consider upgrading if:
- Exceeding 50K loads/month
- Need advanced features
- Require higher rate limits
- Want commercial support

## Resources

- **Mapbox Documentation:** https://docs.mapbox.com/
- **GL JS Examples:** https://docs.mapbox.com/mapbox-gl-js/examples/
- **Mapbox Studio:** https://studio.mapbox.com/
- **Pricing:** https://www.mapbox.com/pricing
- **Support:** https://support.mapbox.com/

---

**Map ready! Start exploring your city.** 🗺️
