import { TestAttempt } from './types';

export interface SmartRecommendations {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: string[];
    supplements: string[];
  };
  training: {
    focus: string[];
    exercises: string[];
    intensity: string;
    frequency: string;
    duration: string;
  };
  safety: {
    injuries: string[];
    prevention: string[];
    recovery: string[];
    warnings: string[];
  };
}

export function generateSmartRecommendations(attempts: TestAttempt[]): SmartRecommendations {
  if (!attempts.length) return getDefaultRecommendations();

  const latest = attempts[0];
  const avgFormScore = attempts.reduce((sum, a) => sum + a.formScore, 0) / attempts.length;
  const testTypes = [...new Set(attempts.map(a => a.testType))];
  const weakAreas = getWeakAreas(attempts);
  const strongAreas = getStrongAreas(attempts);

  return {
    nutrition: generateNutritionPlan(latest, avgFormScore, testTypes),
    training: generateTrainingPlan(weakAreas, strongAreas, avgFormScore),
    safety: generateSafetyPlan(attempts, weakAreas)
  };
}

function generateNutritionPlan(latest: TestAttempt, avgScore: number, testTypes: string[]) {
  const baseCalories = 2200;
  const isEndurance = testTypes.includes('enduranceRun') || testTypes.includes('shuttleRun');
  const isStrength = testTypes.includes('pushUps') || testTypes.includes('pullUps');
  
  let calories = baseCalories;
  let protein = 1.6; // g/kg body weight
  let carbs = 4; // g/kg body weight
  let fats = 1; // g/kg body weight

  if (avgScore < 60) {
    calories += 300; // More calories for improvement
    protein += 0.4; // Extra protein for muscle building
  }

  if (isEndurance) {
    carbs += 2; // More carbs for endurance
    calories += 200;
  }

  if (isStrength) {
    protein += 0.6; // More protein for strength
    calories += 150;
  }

  const meals = [];
  const supplements = [];

  if (avgScore < 70) {
    meals.push("Pre-workout: Banana with peanut butter");
    meals.push("Post-workout: Protein shake with berries");
    supplements.push("Whey protein powder");
  }

  if (isEndurance) {
    meals.push("Breakfast: Oatmeal with fruits and nuts");
    meals.push("Lunch: Quinoa bowl with lean protein");
    supplements.push("Electrolyte drink during workouts");
  }

  if (isStrength) {
    meals.push("Dinner: Grilled chicken with sweet potato");
    meals.push("Snack: Greek yogurt with almonds");
    supplements.push("Creatine monohydrate");
  }

  return { calories, protein, carbs, fats, meals, supplements };
}

function generateTrainingPlan(weakAreas: string[], strongAreas: string[], avgScore: number) {
  const focus = [];
  const exercises = [];
  let intensity = "Moderate";
  let frequency = "3-4 times per week";
  let duration = "45-60 minutes";

  if (weakAreas.includes('strength')) {
    focus.push("Upper body strength building");
    exercises.push("Push-up progressions");
    exercises.push("Assisted pull-ups");
    exercises.push("Plank variations");
  }

  if (weakAreas.includes('endurance')) {
    focus.push("Cardiovascular endurance");
    exercises.push("Interval running");
    exercises.push("Circuit training");
    exercises.push("Jump rope sessions");
  }

  if (weakAreas.includes('flexibility')) {
    focus.push("Mobility and flexibility");
    exercises.push("Dynamic stretching routine");
    exercises.push("Yoga sessions");
    exercises.push("Foam rolling");
  }

  if (weakAreas.includes('agility')) {
    focus.push("Speed and agility training");
    exercises.push("Ladder drills");
    exercises.push("Cone exercises");
    exercises.push("Plyometric jumps");
  }

  if (avgScore < 50) {
    intensity = "Low to Moderate";
    frequency = "4-5 times per week";
    duration = "30-45 minutes";
  } else if (avgScore > 80) {
    intensity = "High";
    frequency = "5-6 times per week";
    duration = "60-90 minutes";
  }

  return { focus, exercises, intensity, frequency, duration };
}

function generateSafetyPlan(attempts: TestAttempt[], weakAreas: string[]) {
  const injuries = [];
  const prevention = [];
  const recovery = [];
  const warnings = [];

  const lowFormScores = attempts.filter(a => a.formScore < 60);
  
  if (lowFormScores.length > 0) {
    warnings.push("Poor form detected in recent tests");
    prevention.push("Focus on technique over speed/reps");
    prevention.push("Consider working with a trainer");
  }

  if (weakAreas.includes('strength')) {
    injuries.push("Muscle strain risk");
    prevention.push("Proper warm-up before strength training");
    recovery.push("48-hour rest between strength sessions");
  }

  if (weakAreas.includes('flexibility')) {
    injuries.push("Joint stiffness and injury risk");
    prevention.push("Daily stretching routine");
    recovery.push("Regular massage or self-massage");
  }

  if (weakAreas.includes('endurance')) {
    injuries.push("Overuse injuries");
    prevention.push("Gradual increase in training volume");
    recovery.push("Adequate sleep (7-9 hours)");
  }

  // General safety recommendations
  prevention.push("Stay hydrated during workouts");
  prevention.push("Listen to your body and rest when needed");
  recovery.push("Active recovery on rest days");
  recovery.push("Proper nutrition for muscle repair");

  return { injuries, prevention, recovery, warnings };
}

function getWeakAreas(attempts: TestAttempt[]): string[] {
  const areas = [];
  const strengthTests = ['pushUps', 'pullUps'];
  const enduranceTests = ['enduranceRun', 'shuttleRun'];
  const flexibilityTests = ['flexibilityTest'];
  const agilityTests = ['agilityLadder', 'verticalJump'];

  const strengthScores = attempts.filter(a => strengthTests.includes(a.testType));
  const enduranceScores = attempts.filter(a => enduranceTests.includes(a.testType));
  const flexibilityScores = attempts.filter(a => flexibilityTests.includes(a.testType));
  const agilityScores = attempts.filter(a => agilityTests.includes(a.testType));

  if (strengthScores.length && strengthScores.reduce((sum, a) => sum + a.formScore, 0) / strengthScores.length < 70) {
    areas.push('strength');
  }
  if (enduranceScores.length && enduranceScores.reduce((sum, a) => sum + a.formScore, 0) / enduranceScores.length < 70) {
    areas.push('endurance');
  }
  if (flexibilityScores.length && flexibilityScores.reduce((sum, a) => sum + a.formScore, 0) / flexibilityScores.length < 70) {
    areas.push('flexibility');
  }
  if (agilityScores.length && agilityScores.reduce((sum, a) => sum + a.formScore, 0) / agilityScores.length < 70) {
    areas.push('agility');
  }

  return areas;
}

function getStrongAreas(attempts: TestAttempt[]): string[] {
  const areas = [];
  const strengthTests = ['pushUps', 'pullUps'];
  const enduranceTests = ['enduranceRun', 'shuttleRun'];
  const flexibilityTests = ['flexibilityTest'];
  const agilityTests = ['agilityLadder', 'verticalJump'];

  const strengthScores = attempts.filter(a => strengthTests.includes(a.testType));
  const enduranceScores = attempts.filter(a => enduranceTests.includes(a.testType));
  const flexibilityScores = attempts.filter(a => flexibilityTests.includes(a.testType));
  const agilityScores = attempts.filter(a => agilityTests.includes(a.testType));

  if (strengthScores.length && strengthScores.reduce((sum, a) => sum + a.formScore, 0) / strengthScores.length > 80) {
    areas.push('strength');
  }
  if (enduranceScores.length && enduranceScores.reduce((sum, a) => sum + a.formScore, 0) / enduranceScores.length > 80) {
    areas.push('endurance');
  }
  if (flexibilityScores.length && flexibilityScores.reduce((sum, a) => sum + a.formScore, 0) / flexibilityScores.length > 80) {
    areas.push('flexibility');
  }
  if (agilityScores.length && agilityScores.reduce((sum, a) => sum + a.formScore, 0) / agilityScores.length > 80) {
    areas.push('agility');
  }

  return areas;
}

function getDefaultRecommendations(): SmartRecommendations {
  return {
    nutrition: {
      calories: 2200,
      protein: 1.6,
      carbs: 4,
      fats: 1,
      meals: ["Balanced meals with lean protein", "Complex carbohydrates", "Healthy fats"],
      supplements: ["Multivitamin", "Omega-3"]
    },
    training: {
      focus: ["General fitness"],
      exercises: ["Basic bodyweight exercises", "Light cardio", "Stretching"],
      intensity: "Moderate",
      frequency: "3 times per week",
      duration: "30-45 minutes"
    },
    safety: {
      injuries: [],
      prevention: ["Proper warm-up", "Stay hydrated", "Listen to your body"],
      recovery: ["Adequate sleep", "Rest days", "Proper nutrition"],
      warnings: []
    }
  };
}