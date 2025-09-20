// Test Analysis Hook
import { useState, useCallback } from 'react';
import { TestType, PerformanceAnalysis } from '@/lib/types';
import APIService from '@/lib/api';
import { saveAttempt } from '@/lib/storage';

export function useTestAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PerformanceAnalysis | null>(null);

  const analyzeVideo = useCallback(async (
    videoBlob: Blob, 
    testType: TestType,
    userId: string
  ) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const response = await APIService.analyzeVideo(videoBlob, testType, userId);
      
      if (response.success && response.analysis) {
        // Save to local storage for offline access
        const attemptData = { 
          id: response.attempt?.id || crypto.randomUUID(), 
          test: testType, 
          timestamp: Date.now(), 
          data: response.analysis.metrics,
          formScore: response.analysis.formScore,
          badge: response.analysis.badge,
          recommendations: response.analysis.recommendations
        };
        saveAttempt(attemptData);
        
        setResult(response.analysis);
        setAnalyzing(false);
        
        // Trigger analytics refresh
        window.dispatchEvent(new CustomEvent('testCompleted', { 
          detail: response.analysis 
        }));
        
        return response.analysis;
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalyzing(false);
      
      // Show specific error message to user
      if (error.message.includes('Video too large')) {
        throw new Error('Video file is too large. Please record a shorter video (max 20MB).');
      } else if (error.message.includes('API key')) {
        throw new Error('Analysis service not configured properly. Please contact support.');
      } else {
        throw new Error('Performance analysis failed. Please try again with a different video.');
      }
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    analyzing,
    result,
    analyzeVideo,
    clearResult
  };
}