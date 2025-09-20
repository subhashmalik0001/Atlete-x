// Analysis Results Component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceAnalysis } from '@/lib/types';
import { BADGE_COLORS } from '@/lib/constants';

interface AnalysisResultsProps {
  analysis: PerformanceAnalysis;
  emgData?: {
    muscleActivity: number;
    fatigue: number;
    activated: boolean;
  };
}

export function AnalysisResults({ analysis, emgData }: AnalysisResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance Analysis</span>
          {analysis.isAdvanced ? (
            <Badge variant="default">Advanced Analytics</Badge>
          ) : (
            <Badge variant="secondary">Basic Analysis</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg border">
            <div className="text-2xl font-bold text-brand-500">
              {analysis.formScore?.toFixed(0) || 0}
            </div>
            <div className="text-sm text-muted-foreground">Form Score</div>
          </div>
          <div className="text-center p-4 rounded-lg border">
            <Badge 
              variant="default" 
              className={`text-lg px-3 py-1 ${BADGE_COLORS[analysis.badge]}`}
            >
              {analysis.badge}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">Performance Level</div>
          </div>
          <div className="text-center p-4 rounded-lg border">
            <div className="text-lg font-semibold">
              {Object.values(analysis.metrics || {})[0]?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Primary Metric</div>
          </div>
        </div>
        
        {/* Expert Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Expert Recommendations:</div>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* EMG Data */}
        {emgData && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">EMG Sensor Data:</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded border">
                <div className="font-semibold">{emgData.muscleActivity.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Activity</div>
              </div>
              <div className="p-2 rounded border">
                <div className="font-semibold">{emgData.fatigue.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Fatigue</div>
              </div>
              <div className="p-2 rounded border">
                <div className="font-semibold">{emgData.activated ? 'Active' : 'Rest'}</div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {analysis.errors && analysis.errors.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2 text-red-600">Issues Detected:</div>
            <ul className="space-y-1">
              {analysis.errors.map((error: string, idx: number) => (
                <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}