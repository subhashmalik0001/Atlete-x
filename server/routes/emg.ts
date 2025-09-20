import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

export interface EMGData {
  userId: string;
  emgValue: number;
  muscleActivity: number;
  fatigue: number;
  activated: boolean;
  timestamp: number;
}

export const handleEMGData = async (req: Request, res: Response) => {
  try {
    const { userId, emgValue, muscleActivity, fatigue, activated }: EMGData = req.body;
    
    // Store EMG data (would use Supabase in production)
    const emgReading = {
      id: randomUUID(),
      user_id: userId,
      emg_value: emgValue,
      muscle_activity: muscleActivity,
      fatigue_level: fatigue,
      activation_detected: activated,
      timestamp: new Date().toISOString()
    };
    
    // Analyze EMG data for insights
    const analysis = analyzeEMGData(emgValue, muscleActivity, fatigue);
    
    res.json({ 
      success: true, 
      data: emgReading,
      analysis 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process EMG data' });
  }
};

export const getEMGHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Mock EMG history data
    const history = generateMockEMGHistory(userId);
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch EMG history' });
  }
};

function analyzeEMGData(emgValue: number, muscleActivity: number, fatigue: number) {
  return {
    performanceLevel: muscleActivity > 70 ? 'High' : muscleActivity > 40 ? 'Medium' : 'Low',
    fatigueWarning: fatigue > 80,
    recommendations: generateRecommendations(muscleActivity, fatigue),
    injuryRisk: calculateInjuryRisk(fatigue, muscleActivity)
  };
}

function generateRecommendations(activity: number, fatigue: number): string[] {
  const recommendations = [];
  
  if (fatigue > 70) {
    recommendations.push('Consider taking a rest break');
  }
  if (activity < 30) {
    recommendations.push('Increase muscle engagement');
  }
  if (activity > 90) {
    recommendations.push('Monitor for overexertion');
  }
  
  return recommendations;
}

function calculateInjuryRisk(fatigue: number, activity: number): 'Low' | 'Medium' | 'High' {
  if (fatigue > 80 && activity > 80) return 'High';
  if (fatigue > 60 || activity > 70) return 'Medium';
  return 'Low';
}

function generateMockEMGHistory(userId: string) {
  return Array.from({ length: 10 }, (_, i) => ({
    id: randomUUID(),
    user_id: userId,
    muscle_activity: 30 + Math.random() * 50,
    fatigue_level: Math.random() * 60,
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
  }));
}