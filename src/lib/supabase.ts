import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'analyst' | 'citizen';
          organization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'analyst' | 'citizen';
          organization?: string | null;
        };
        Update: {
          full_name?: string | null;
          organization?: string | null;
        };
      };
      layers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          type: string;
          color: string;
          is_active: boolean;
          opacity: number;
          data_source: string | null;
          refresh_interval: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string | null;
          name: string;
          description?: string | null;
          type: string;
          color?: string;
          is_active?: boolean;
          opacity?: number;
          data_source?: string | null;
          refresh_interval?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_active?: boolean;
          opacity?: number;
        };
      };
      issues: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string;
          category: string;
          priority: string;
          status: string;
          latitude: number;
          longitude: number;
          address: string | null;
          image_url: string | null;
          ai_classified: boolean;
          ai_confidence: number | null;
          votes: number;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          user_id?: string | null;
          title: string;
          description: string;
          category: string;
          priority?: string;
          status?: string;
          latitude: number;
          longitude: number;
          address?: string | null;
          image_url?: string | null;
          ai_classified?: boolean;
          ai_confidence?: number | null;
        };
        Update: {
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
        };
      };
      layer_data: {
        Row: {
          id: string;
          layer_id: string;
          latitude: number;
          longitude: number;
          value: number;
          parameter_name: string | null;
          metadata: any;
          recorded_at: string;
          created_at: string;
        };
      };
      ai_predictions: {
        Row: {
          id: string;
          model_name: string;
          prediction_type: string;
          target_area: string | null;
          latitude: number | null;
          longitude: number | null;
          predicted_value: number | null;
          confidence: number | null;
          prediction_date: string;
          for_date: string | null;
          data: any;
          created_at: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          layer_id: string | null;
          issue_id: string | null;
          title: string;
          message: string;
          severity: string;
          latitude: number | null;
          longitude: number | null;
          radius_km: number;
          is_active: boolean;
          auto_generated: boolean;
          expires_at: string | null;
          created_at: string;
        };
      };
    };
  };
};
