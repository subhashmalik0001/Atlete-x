// Constants and Configuration
import { TestType, BadgeLevel } from './types';

export const TEST_CONFIGS = {
  verticalJump: { 
    name: "Vertical Jump", 
    unit: "cm", 
    field: "jumpHeightCm",
    setup: "Place phone at knee height, side view.",
    duration: "30-60s"
  },
  sitUps: { 
    name: "Sit-ups", 
    unit: "reps", 
    field: "reps",
    setup: "Place phone at chest level, front view.",
    duration: "60s"
  },
  pushUps: { 
    name: "Push-ups", 
    unit: "reps", 
    field: "reps",
    setup: "Place phone at side angle, capture full body.",
    duration: "60s"
  },
  pullUps: { 
    name: "Pull-ups", 
    unit: "reps", 
    field: "reps",
    setup: "Mount phone to capture full pull-up motion.",
    duration: "60s"
  },
  shuttleRun: { 
    name: "Shuttle Run", 
    unit: "laps", 
    field: "laps",
    setup: "Keep phone stable, wide view of running lane.",
    duration: "90s"
  },
  enduranceRun: { 
    name: "Endurance Run", 
    unit: "km", 
    field: "distanceKm",
    setup: "Wear TalentBand for pace. Use outdoor light.",
    duration: "300s"
  },
  flexibilityTest: { 
    name: "Flexibility Test", 
    unit: "cm", 
    field: "reachCm",
    setup: "Place phone to capture full range of motion.",
    duration: "30s"
  },
  agilityLadder: { 
    name: "Agility Ladder", 
    unit: "sec", 
    field: "completionTime",
    setup: "Position phone to capture ladder footwork pattern.",
    duration: "60s"
  },
  heightWeight: { 
    name: "Height/Weight", 
    unit: "cm", 
    field: "heightCm",
    setup: "Enter details manually or scan from device.",
    duration: "30s"
  }
} as const;

export const PERFORMANCE_BENCHMARKS: Record<TestType, Array<{label: BadgeLevel, value: number}>> = {
  verticalJump: [
    { label: "Good", value: 35 },
    { label: "District Elite", value: 45 },
    { label: "State Level", value: 55 },
    { label: "National Standard", value: 65 }
  ],
  sitUps: [
    { label: "Good", value: 20 },
    { label: "District Elite", value: 35 },
    { label: "State Level", value: 45 },
    { label: "National Standard", value: 55 }
  ],
  pushUps: [
    { label: "Good", value: 15 },
    { label: "District Elite", value: 25 },
    { label: "State Level", value: 35 },
    { label: "National Standard", value: 45 }
  ],
  pullUps: [
    { label: "Good", value: 5 },
    { label: "District Elite", value: 10 },
    { label: "State Level", value: 15 },
    { label: "National Standard", value: 20 }
  ],
  shuttleRun: [
    { label: "Good", value: 8 },
    { label: "District Elite", value: 12 },
    { label: "State Level", value: 16 },
    { label: "National Standard", value: 20 }
  ],
  enduranceRun: [
    { label: "Good", value: 2 },
    { label: "District Elite", value: 3 },
    { label: "State Level", value: 4 },
    { label: "National Standard", value: 5 }
  ],
  flexibilityTest: [
    { label: "Good", value: 15 },
    { label: "District Elite", value: 25 },
    { label: "State Level", value: 35 },
    { label: "National Standard", value: 45 }
  ],
  agilityLadder: [
    { label: "Good", value: 12 },
    { label: "District Elite", value: 10 },
    { label: "State Level", value: 8 },
    { label: "National Standard", value: 6 }
  ],
  heightWeight: [
    { label: "Good", value: 160 },
    { label: "District Elite", value: 170 },
    { label: "State Level", value: 180 },
    { label: "National Standard", value: 190 }
  ]
};

export const BADGE_COLORS: Record<BadgeLevel, string> = {
  "Good": "bg-gray-500",
  "District Elite": "bg-green-500", 
  "State Level": "bg-blue-500",
  "National Standard": "bg-yellow-500"
};