// API Service Layer
import { TestAttempt, TestType, UserProfile } from './types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class APIService {
  // Authentication
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Food Analysis
  static async analyzeFoodImage(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('foodImage', imageFile);

    const response = await fetch('/api/food/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Food analysis failed: ${response.status}`);
    }

    return response.json();
  }

  // Test Analysis
  static async analyzeVideo(videoBlob: Blob, testType: TestType, userId: string): Promise<any> {
    const formData = new FormData();
    formData.append('video', videoBlob, `test-${testType}-${Date.now()}.mp4`);
    formData.append('testType', testType);
    formData.append('userId', userId);

    const response = await fetch('/api/tests/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    return response.json();
  }

  // Test History
  static async getTestHistory(userId: string, limit = 50): Promise<TestAttempt[]> {
    const response = await fetch(`/api/tests/history/${userId}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch test history');
    
    const data = await response.json();
    return data.attempts || [];
  }

  // User Stats
  static async getUserStats(userId: string) {
    const response = await fetch(`/api/tests/stats/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user stats');
    
    const data = await response.json();
    return data.stats;
  }

  // Leaderboard
  static async getLeaderboard(level: 'district' | 'state' | 'national', sport?: string, region?: string, limit = 100) {
    const params = new URLSearchParams({ level, limit: limit.toString() });
    if (sport && sport !== 'All') params.append('sport', sport);
    if (region) params.append('region', region);
    
    const response = await fetch(`/api/leaderboard?${params}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    
    const data = await response.json();
    return data.leaderboard || [];
  }

  // Profile Management
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const response = await fetch(`/api/profile/${userId}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.profile;
  }

  static async saveProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`/api/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });

    if (!response.ok) throw new Error('Failed to save profile');
    
    const data = await response.json();
    return data.profile;
  }

  // Training Plans
  static async getTrainingPlans(userId: string) {
    const response = await fetch(`/api/training-plans/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch training plans');
    
    const data = await response.json();
    return data;
  }

  static async saveTrainingPlan(userId: string, planId: string, customExercises?: any[]) {
    const response = await fetch(`/api/training-plans/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, customExercises })
    });

    if (!response.ok) throw new Error('Failed to save training plan');
    
    return response.json();
  }
}

export default APIService;