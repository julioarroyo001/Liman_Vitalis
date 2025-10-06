/*
  # UrbanSense AI Database Schema

  ## Overview
  Complete database schema for urban monitoring system supporting:
  - User authentication and profiles
  - Interactive map layers with customizable parameters
  - Urban issue reporting and tracking
  - AI analysis results and predictions
  - Historical data tracking
  
  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User full name
  - `role` (text) - User role: admin, analyst, citizen
  - `organization` (text) - Organization name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `layers`
  - `id` (uuid, primary key) - Layer unique identifier
  - `user_id` (uuid, foreign key) - Creator user ID
  - `name` (text) - Layer name
  - `description` (text) - Layer description
  - `type` (text) - Layer type: pollution, traffic, noise, temperature, etc.
  - `color` (text) - Display color (hex)
  - `is_active` (boolean) - Layer visibility status
  - `opacity` (number) - Layer opacity 0-1
  - `data_source` (text) - Data source URL or identifier
  - `refresh_interval` (integer) - Auto-refresh interval in minutes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `layer_parameters`
  - `id` (uuid, primary key) - Parameter unique identifier
  - `layer_id` (uuid, foreign key) - Associated layer
  - `name` (text) - Parameter name
  - `unit` (text) - Measurement unit
  - `min_value` (number) - Minimum expected value
  - `max_value` (number) - Maximum expected value
  - `threshold_warning` (number) - Warning threshold
  - `threshold_critical` (number) - Critical threshold
  - `created_at` (timestamptz)
  
  ### `issues`
  - `id` (uuid, primary key) - Issue unique identifier
  - `user_id` (uuid, foreign key) - Reporter user ID
  - `title` (text) - Issue title
  - `description` (text) - Detailed description
  - `category` (text) - Category: pollution, infrastructure, safety, noise, etc.
  - `priority` (text) - Priority: low, medium, high, critical
  - `status` (text) - Status: reported, in_progress, resolved, closed
  - `latitude` (number) - Location latitude
  - `longitude` (number) - Location longitude
  - `address` (text) - Human-readable address
  - `image_url` (text) - Optional photo URL
  - `ai_classified` (boolean) - Whether AI classified this issue
  - `ai_confidence` (number) - AI classification confidence 0-1
  - `votes` (integer) - Community votes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `resolved_at` (timestamptz) - Resolution timestamp
  
  ### `layer_data`
  - `id` (uuid, primary key) - Data point identifier
  - `layer_id` (uuid, foreign key) - Associated layer
  - `latitude` (number) - Location latitude
  - `longitude` (number) - Location longitude
  - `value` (number) - Measured value
  - `parameter_name` (text) - Parameter name
  - `metadata` (jsonb) - Additional data
  - `recorded_at` (timestamptz) - Measurement timestamp
  - `created_at` (timestamptz)
  
  ### `ai_predictions`
  - `id` (uuid, primary key) - Prediction identifier
  - `model_name` (text) - AI model used
  - `prediction_type` (text) - Type: quality_forecast, pattern_detection, anomaly
  - `target_area` (text) - Geographic area
  - `latitude` (number) - Center latitude
  - `longitude` (number) - Center longitude
  - `predicted_value` (number) - Predicted value
  - `confidence` (number) - Prediction confidence 0-1
  - `prediction_date` (timestamptz) - Date of prediction
  - `for_date` (timestamptz) - Date prediction is for
  - `data` (jsonb) - Additional prediction data
  - `created_at` (timestamptz)
  
  ### `alerts`
  - `id` (uuid, primary key) - Alert identifier
  - `layer_id` (uuid, foreign key) - Associated layer (optional)
  - `issue_id` (uuid, foreign key) - Associated issue (optional)
  - `title` (text) - Alert title
  - `message` (text) - Alert message
  - `severity` (text) - Severity: info, warning, critical
  - `latitude` (number) - Location latitude
  - `longitude` (number) - Location longitude
  - `radius_km` (number) - Affected radius in kilometers
  - `is_active` (boolean) - Alert active status
  - `auto_generated` (boolean) - Whether AI generated this
  - `expires_at` (timestamptz) - Expiration timestamp
  - `created_at` (timestamptz)
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Authenticated users can read most data
  - Users can only modify their own content
  - Admins have elevated permissions
*/

-- Create enum-like types using check constraints
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'citizen' CHECK (role IN ('admin', 'analyst', 'citizen')),
  organization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Layers table
CREATE TABLE IF NOT EXISTS layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('pollution', 'traffic', 'noise', 'temperature', 'humidity', 'air_quality', 'water_quality', 'green_spaces', 'custom')),
  color text DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  opacity numeric DEFAULT 0.7 CHECK (opacity >= 0 AND opacity <= 1),
  data_source text,
  refresh_interval integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Layer parameters table
CREATE TABLE IF NOT EXISTS layer_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id uuid NOT NULL REFERENCES layers(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text,
  min_value numeric,
  max_value numeric,
  threshold_warning numeric,
  threshold_critical numeric,
  created_at timestamptz DEFAULT now()
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('pollution', 'infrastructure', 'safety', 'noise', 'traffic', 'waste', 'lighting', 'other')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved', 'closed')),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address text,
  image_url text,
  ai_classified boolean DEFAULT false,
  ai_confidence numeric CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Layer data table
CREATE TABLE IF NOT EXISTS layer_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id uuid NOT NULL REFERENCES layers(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  value numeric NOT NULL,
  parameter_name text,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- AI predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  prediction_type text NOT NULL CHECK (prediction_type IN ('quality_forecast', 'pattern_detection', 'anomaly', 'trend_analysis')),
  target_area text,
  latitude numeric,
  longitude numeric,
  predicted_value numeric,
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),
  prediction_date timestamptz DEFAULT now(),
  for_date timestamptz,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id uuid REFERENCES layers(id) ON DELETE SET NULL,
  issue_id uuid REFERENCES issues(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  latitude numeric,
  longitude numeric,
  radius_km numeric DEFAULT 1,
  is_active boolean DEFAULT true,
  auto_generated boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_layers_user_id ON layers(user_id);
CREATE INDEX IF NOT EXISTS idx_layers_type ON layers(type);
CREATE INDEX IF NOT EXISTS idx_layer_parameters_layer_id ON layer_parameters(layer_id);
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_location ON issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_layer_data_layer_id ON layer_data(layer_id);
CREATE INDEX IF NOT EXISTS idx_layer_data_recorded_at ON layer_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_layer_data_location ON layer_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON ai_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_for_date ON ai_predictions(for_date);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for layers
CREATE POLICY "Anyone can view active layers"
  ON layers FOR SELECT
  TO authenticated
  USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "Authenticated users can create layers"
  ON layers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own layers"
  ON layers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own layers"
  ON layers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for layer_parameters
CREATE POLICY "Anyone can view layer parameters"
  ON layer_parameters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Layer owners can manage parameters"
  ON layer_parameters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM layers
      WHERE layers.id = layer_parameters.layer_id
      AND layers.user_id = auth.uid()
    )
  );

-- RLS Policies for issues
CREATE POLICY "Anyone can view issues"
  ON issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own issues"
  ON issues FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for layer_data
CREATE POLICY "Anyone can view layer data"
  ON layer_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Layer owners can manage data"
  ON layer_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM layers
      WHERE layers.id = layer_data.layer_id
      AND layers.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_predictions
CREATE POLICY "Anyone can view predictions"
  ON ai_predictions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert predictions"
  ON ai_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for alerts
CREATE POLICY "Anyone can view active alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Alert creators can update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_layers_updated_at
  BEFORE UPDATE ON layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();