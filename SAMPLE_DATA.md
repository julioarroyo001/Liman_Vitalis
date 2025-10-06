# Sample Data & Testing Guide

Instructions for populating UrbanSense AI with sample data for testing and demonstration purposes.

## Quick Sample Data Setup

### Method 1: Using the Application UI

The easiest way to create sample data is through the application itself:

1. **Create an Account**
   - Sign up with email/password
   - This creates your profile automatically

2. **Create Sample Layers**
   - Go to "Layers" panel
   - Create the following layers:

   ```
   Layer 1: Air Quality Index
   - Type: Air Quality
   - Color: #EF4444 (red)
   - Description: PM2.5 and PM10 measurements

   Layer 2: Traffic Flow
   - Type: Traffic
   - Color: #F59E0B (orange)
   - Description: Real-time traffic congestion

   Layer 3: Noise Levels
   - Type: Noise
   - Color: #8B5CF6 (purple)
   - Description: Decibel measurements

   Layer 4: Temperature
   - Type: Temperature
   - Color: #3B82F6 (blue)
   - Description: Ambient temperature readings
   ```

3. **Report Sample Issues**
   - Click various locations on the map
   - Create diverse issues:

   ```
   Issue 1: Critical Safety
   - Title: "Dangerous pothole on main street"
   - Category: Infrastructure
   - Description: "Urgent: Large pothole causing vehicle damage and potential accidents. Located in high-traffic area near school."

   Issue 2: Medium Pollution
   - Title: "Illegal waste dumping site"
   - Category: Waste
   - Description: "Moderate amount of waste accumulating in park area. Needs cleanup within a week."

   Issue 3: High Noise
   - Title: "Construction noise above limits"
   - Category: Noise
   - Description: "Serious noise pollution from construction site operating beyond permitted hours."

   Issue 4: Low Infrastructure
   - Title: "Sidewalk needs minor repair"
   - Category: Infrastructure
   - Description: "Small crack in sidewalk, should be repaired to prevent further damage."
   ```

### Method 2: Using SQL (Advanced)

For developers who want to quickly populate the database:

```sql
-- Insert sample layer data (run in Supabase SQL editor)
INSERT INTO layer_data (layer_id, latitude, longitude, value, parameter_name, recorded_at)
SELECT
  (SELECT id FROM layers WHERE type = 'pollution' LIMIT 1),
  19.4326 + (random() * 0.1 - 0.05),
  -99.1332 + (random() * 0.1 - 0.05),
  50 + (random() * 100),
  'PM2.5',
  NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 100);

-- Insert sample issues at various locations
INSERT INTO issues (user_id, title, description, category, priority, status, latitude, longitude, ai_classified)
VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Broken street light on Avenue A',
    'Street light has been non-functional for 3 days, creating safety concerns at night.',
    'lighting',
    'high',
    'reported',
    19.4326,
    -99.1332,
    true
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Heavy traffic congestion daily',
    'Significant traffic congestion occurs every morning between 7-9 AM on this intersection.',
    'traffic',
    'medium',
    'in_progress',
    19.4426,
    -99.1232,
    true
  );
```

## Realistic Test Scenarios

### Scenario 1: Air Quality Crisis

**Setup:**
1. Create an "Air Quality" layer
2. Add 50-100 data points with high values (>150 AQI)
3. Report multiple pollution-related issues
4. Let AI detect the anomaly

**Expected Results:**
- AI should generate critical alerts
- Dashboard shows rising trend
- Hotspot identified on map
- Multiple warnings in analytics

### Scenario 2: Infrastructure Hotspot

**Setup:**
1. Report 5+ infrastructure issues in same area
2. Use varied descriptions (potholes, sidewalks, etc.)
3. Different priorities

**Expected Results:**
- Hotspot appears in analytics
- AI generates alert for issue cluster
- Pattern recognition identifies area
- Priority aggregation shown

### Scenario 3: Trend Analysis

**Setup:**
1. Create temperature layer
2. Add data points over 7 days
3. Show increasing trend (simulate heat wave)

**Expected Results:**
- Trend chart shows upward slope
- AI predicts continued increase
- Warning generated for significant change
- Forecast shown on dashboard

### Scenario 4: Multi-Category Issues

**Setup:**
1. Report issues in all 8 categories
2. Vary priorities and locations
3. Update some to "in_progress" and "resolved"

**Expected Results:**
- Category distribution chart populated
- Priority pie chart shows distribution
- Status filtering works correctly
- Dashboard stats accurate

## Testing Checklist

### Authentication Tests
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out and verify session cleared
- [ ] Profile created in database
- [ ] Invalid credentials rejected

### Map Tests
- [ ] Map loads correctly
- [ ] Navigation controls work
- [ ] Click to report issue
- [ ] Markers appear for issues
- [ ] Popups show issue details
- [ ] Layer panel toggles visibility
- [ ] Legend displays correctly

### Issue Management Tests
- [ ] Create new issue
- [ ] AI classifies priority
- [ ] Issue appears on map
- [ ] Issue appears in Issues panel
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Update issue status
- [ ] Real-time updates work

### Layer Management Tests
- [ ] Create new layer
- [ ] Edit layer properties
- [ ] Delete layer
- [ ] Toggle layer visibility
- [ ] Adjust layer opacity
- [ ] Layer color applies

### Dashboard Tests
- [ ] Statistics display correctly
- [ ] Charts render with data
- [ ] Trend analysis shows
- [ ] AI insights generated
- [ ] Hotspots displayed
- [ ] Filters affect data

### AI Analysis Tests
- [ ] Priority classification works
- [ ] Confidence scores reasonable
- [ ] Anomaly detection triggers
- [ ] Trend analysis accurate
- [ ] Hotspots identified correctly
- [ ] Alerts generated appropriately

### Performance Tests
- [ ] Page load under 3 seconds
- [ ] Smooth map navigation
- [ ] Real-time updates instant
- [ ] No memory leaks
- [ ] Mobile responsive

### Security Tests
- [ ] Can't access without login
- [ ] Can't modify others' data
- [ ] RLS policies enforced
- [ ] No SQL injection possible
- [ ] XSS protection works

## Sample Data Generators

### JavaScript Functions

Add these to your browser console for quick data generation:

```javascript
// Generate random coordinates around Mexico City
function randomCoords() {
  return {
    lat: 19.4326 + (Math.random() * 0.1 - 0.05),
    lng: -99.1332 + (Math.random() * 0.1 - 0.05)
  };
}

// Generate sample issue titles
const sampleIssues = [
  { title: 'Pothole on main road', category: 'infrastructure', priority: 'high' },
  { title: 'Overflowing trash bin', category: 'waste', priority: 'medium' },
  { title: 'Broken traffic light', category: 'infrastructure', priority: 'critical' },
  { title: 'Noise complaint - construction', category: 'noise', priority: 'medium' },
  { title: 'Air quality concerns', category: 'pollution', priority: 'high' },
  { title: 'Heavy traffic congestion', category: 'traffic', priority: 'medium' },
  { title: 'Street light not working', category: 'lighting', priority: 'low' },
  { title: 'Graffiti on public property', category: 'other', priority: 'low' }
];

// Use in your application to quickly create test data
```

## Data Validation

### Check Data Integrity

Run these queries in Supabase SQL Editor:

```sql
-- Count records by table
SELECT
  'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'layers', COUNT(*) FROM layers
UNION ALL
SELECT 'issues', COUNT(*) FROM issues
UNION ALL
SELECT 'layer_data', COUNT(*) FROM layer_data
UNION ALL
SELECT 'ai_predictions', COUNT(*) FROM ai_predictions
UNION ALL
SELECT 'alerts', COUNT(*) FROM alerts;

-- Check for orphaned records
SELECT COUNT(*) as orphaned_layer_data
FROM layer_data ld
WHERE NOT EXISTS (SELECT 1 FROM layers l WHERE l.id = ld.layer_id);

-- Verify AI classification
SELECT
  ai_classified,
  priority,
  COUNT(*) as count,
  AVG(ai_confidence) as avg_confidence
FROM issues
GROUP BY ai_classified, priority
ORDER BY ai_classified, priority;

-- Check issue status distribution
SELECT status, COUNT(*) as count
FROM issues
GROUP BY status
ORDER BY count DESC;
```

## Cleanup Commands

### Reset Sample Data

```sql
-- WARNING: These commands delete data. Use with caution!

-- Delete all issues
DELETE FROM issues;

-- Delete all layer data
DELETE FROM layer_data;

-- Delete all layers
DELETE FROM layers;

-- Delete all AI predictions
DELETE FROM ai_predictions;

-- Delete all alerts
DELETE FROM alerts;

-- Note: Don't delete profiles unless you want to remove users
```

## Performance Benchmarks

Expected performance with sample data:

| Metric | With 100 Issues | With 1,000 Issues | With 10,000 Issues |
|--------|----------------|-------------------|-------------------|
| Map Load | < 1s | < 2s | < 3s |
| Dashboard Load | < 1s | < 2s | < 4s |
| Issue Filter | < 0.5s | < 1s | < 2s |
| AI Analysis | < 1s | < 3s | < 10s |
| Real-time Update | < 0.1s | < 0.1s | < 0.2s |

## Troubleshooting Sample Data

### Issues Not Appearing
1. Check user is authenticated
2. Verify RLS policies allow read
3. Confirm issues table has data
4. Check filter settings

### AI Not Classifying
1. Verify description field has content
2. Check for keywords in description
3. Ensure category is set
4. Review confidence threshold

### Charts Not Showing
1. Confirm data exists for time period
2. Check date filters
3. Verify data format is correct
4. Review console for errors

### Map Markers Missing
1. Check latitude/longitude values
2. Verify map bounds include locations
3. Ensure issues have valid coordinates
4. Check marker creation logic

## Demo Data Set

For presentations and demos, use this curated data set:

**Location:** Mexico City Center (Zócalo area)
**Time Period:** Last 7 days
**Issue Count:** 25-30 diverse issues
**Layer Count:** 4-5 environmental layers
**Data Points:** 100-200 per layer

This provides:
- Visible patterns and hotspots
- Meaningful AI insights
- Interesting trend data
- Good chart visualizations
- Realistic urban scenario

---

**Happy Testing!** 🧪

Remember: Sample data helps demonstrate capabilities, but real-world data is where UrbanSense AI truly shines.
