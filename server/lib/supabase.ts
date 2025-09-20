import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface TestAttempt {
  id: string;
  user_id: string;
  test_type: string;
  video_url?: string;
  analysis_result: any;
  metrics: Record<string, number>;
  form_score: number;
  badge: string;
  recommendations: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  age?: number;
  gender?: string;
  district?: string;
  sport?: string;
  created_at: string;
  updated_at: string;
}