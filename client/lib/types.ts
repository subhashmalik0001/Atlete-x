// Core Types for AthletiX Platform
export type TestType = 
  | "verticalJump" 
  | "sitUps" 
  | "pushUps" 
  | "pullUps" 
  | "shuttleRun" 
  | "enduranceRun" 
  | "flexibilityTest" 
  | "agilityLadder" 
  | "heightWeight";

export interface TestAttempt {
  id: string;
  userId: string;
  testType: TestType;
  videoUrl?: string;
  analysisResult: PerformanceAnalysis;
  metrics: Record<string, number>;
  formScore: number;
  badge: BadgeLevel;
  recommendations: string[];
  createdAt: string;
}

export interface PerformanceAnalysis {
  testType: TestType;
  metrics: Record<string, number>;
  formScore: number;
  recommendations: string[];
  badge: BadgeLevel;
  errors: string[];
  isAdvanced: boolean;
}

export type BadgeLevel = "Good" | "District Elite" | "State Level" | "National Standard";

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: string;
  district?: string;
  sport?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EMGReading {
  id: string;
  userId: string;
  testAttemptId?: string;
  emgValue: number;
  muscleActivity: number;
  fatigueLevel: number;
  activationDetected: boolean;
  timestamp: string;
}