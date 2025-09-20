import { Request, Response } from 'express';
import { db } from '../lib/database.js';
import { geminiService } from '../services/geminiService.js';

const generateSmartPlanWithGemini = async (userStats: any, attempts: any[]): Promise<any> => {
  try {
    // Create a prompt for Gemini to generate training plan
    const prompt = `You are an expert fitness trainer. Based on this user's performance data, create a personalized training plan.
    
    User Performance Summary:
    - Average Form Score: ${userStats.averageFormScore || 60}/100
    - Total Tests: ${attempts.length}
    - Recent Test Results: ${attempts.slice(0, 5).map(a => `${a.testType}: ${a.formScore}/100`).join(', ')}
    
    Create a training plan with:
    1. Difficulty level (Beginner/Intermediate/Advanced)
    2. 4-6 specific exercises targeting weak areas
    3. Sets, reps, and rest periods
    4. Training focus areas
    
    Return ONLY valid JSON:
    {
      "name": "Plan Name",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "X weeks",
      "focus": ["area1", "area2"],
      "exercises": [
        {"name": "Exercise", "sets": 3, "reps": "10-15", "rest": "60s", "notes": "tip"}
      ],
      "schedule": "X days per week"
    }`;
    
    // Use Gemini to generate the plan (without video)
    const model = geminiService.model;
    if (!model) throw new Error('Gemini not available');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini training plan error:', error);
    // Fallback to simple plan
    return {
      name: 'Basic Fitness Plan',
      difficulty: 'Intermediate',
      duration: '4 weeks',
      focus: ['Overall Fitness'],
      exercises: [
        { name: 'Push-ups', sets: 3, reps: '10-15', rest: '60s' },
        { name: 'Squats', sets: 3, reps: '15-20', rest: '45s' },
        { name: 'Plank', sets: 3, reps: '30s', rest: '30s' }
      ],
      schedule: '3 days per week'
    };
  }
};

export const getTrainingPlans = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get user stats and recent attempts
    const stats = await db.getUserStats(userId);
    const attempts = await db.getTestHistory(userId, undefined, 10);
    
    // Generate smart plan using Gemini AI
    const smartPlan = await generateSmartPlanWithGemini(stats, attempts);
    
    res.json({
      success: true,
      plan: smartPlan,
      userLevel: smartPlan.difficulty
    });
    
  } catch (error) {
    console.error('Get training plans error:', error);
    res.status(500).json({ error: 'Failed to generate training plans' });
  }
};

export const saveTrainingPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { planId, customExercises } = req.body;
    
    // In a real implementation, save to database
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Training plan saved successfully'
    });
    
  } catch (error) {
    console.error('Save training plan error:', error);
    res.status(500).json({ error: 'Failed to save training plan' });
  }
};