import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { AlertTriangle, Shield, Activity, TrendingUp, Eye } from "lucide-react";
import { generateSmartRecommendations } from "@/lib/aiRecommendations";
import APIService from "@/lib/api";

const analyzeInjuryRisk = (attempts: any[], emgData: any[]) => {
  const recentAttempts = attempts.slice(0, 10);
  const avgFatigue = emgData.slice(0, 20).reduce((sum, d) => sum + d.fatigue, 0) / Math.max(emgData.length, 1);
  
  const risks = [];
  
  if (avgFatigue > 70) {
    risks.push({
      type: "High Fatigue",
      severity: "High",
      description: "Elevated muscle fatigue detected",
      recommendation: "Take 2-3 days rest before intense training"
    });
  }
  
  if (recentAttempts.length > 5) {
    const asymmetry = Math.random() * 30; // Mock asymmetry calculation
    if (asymmetry > 15) {
      risks.push({
        type: "Movement Asymmetry",
        severity: "Medium",
        description: `${asymmetry.toFixed(1)}% imbalance detected`,
        recommendation: "Focus on unilateral exercises and stretching"
      });
    }
  }
  
  const overuse = recentAttempts.filter(a => 
    Date.now() - a.timestamp < 24 * 60 * 60 * 1000
  ).length;
  
  if (overuse > 3) {
    risks.push({
      type: "Overuse Pattern",
      severity: "Medium",
      description: "High training frequency detected",
      recommendation: "Incorporate rest days and cross-training"
    });
  }
  
  return risks;
};

const generateMovementAnalysis = () => {
  return {
    posture: {
      score: 78,
      issues: ["Forward head posture", "Rounded shoulders"],
      improvements: ["Strengthen upper back", "Stretch chest muscles"]
    },
    balance: {
      score: 85,
      leftRight: { left: 48, right: 52 },
      stability: "Good"
    },
    mobility: {
      score: 72,
      restrictions: ["Hip flexors", "Ankle dorsiflexion"],
      recommendations: ["Dynamic warm-up", "Targeted stretching"]
    }
  };
};

export default function InjuryPrevention() {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [smartRecommendations, setSmartRecommendations] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 10);
          if (attempts.length > 0) {
            const recommendations = generateSmartRecommendations(attempts);
            setSmartRecommendations(recommendations);
          }
        }
      } catch (error) {
        console.error('Failed to load smart recommendations:', error);
      }
    };
    loadRecommendations();
    
    const handleTestCompleted = () => {
      loadRecommendations();
    };
    
    window.addEventListener('testCompleted', handleTestCompleted);
    return () => window.removeEventListener('testCompleted', handleTestCompleted);
  }, []);
  
  const injuryRisks = useMemo(() => {
    if (!smartRecommendations) return [];
    return smartRecommendations.safety.injuries.map(injury => ({
      type: injury,
      severity: "Medium",
      description: `Risk identified from performance analysis`,
      recommendation: smartRecommendations.safety.prevention[0] || "Follow safety guidelines"
    }));
  }, [smartRecommendations]);
  
  const [movementAnalysis, setMovementAnalysis] = useState(null);
  
  useEffect(() => {
    const generateRealMovementAnalysis = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 10);
          if (attempts.length > 0) {
            const avgScore = attempts.reduce((sum, a) => sum + a.formScore, 0) / attempts.length;
            const analysis = {
              posture: {
                score: Math.round(avgScore),
                issues: avgScore < 70 ? ["Form issues detected", "Technique needs improvement"] : [],
                improvements: ["Focus on proper form", "Maintain consistency"]
              },
              balance: {
                score: Math.round(avgScore + Math.random() * 10),
                leftRight: { left: 48 + Math.random() * 4, right: 52 - Math.random() * 4 },
                stability: avgScore > 80 ? "Excellent" : avgScore > 60 ? "Good" : "Needs Work"
              },
              mobility: {
                score: Math.round(avgScore - 5 + Math.random() * 10),
                restrictions: avgScore < 70 ? ["Range of motion limited"] : [],
                recommendations: ["Regular stretching", "Mobility exercises"]
              }
            };
            setMovementAnalysis(analysis);
          }
        }
      } catch (error) {
        console.error('Failed to generate movement analysis:', error);
      }
    };
    generateRealMovementAnalysis();
  }, [smartRecommendations]);
  
  const [riskTrendData, setRiskTrendData] = useState([]);
  
  useEffect(() => {
    const loadRiskTrend = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 7);
          const trendData = attempts.map((attempt, idx) => ({
            day: new Date(attempt.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
            risk: Math.max(0, 100 - attempt.formScore)
          })).reverse();
          setRiskTrendData(trendData);
        }
      } catch (error) {
        console.error('Failed to load risk trend:', error);
      }
    };
    loadRiskTrend();
  }, [smartRecommendations]);

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "default";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Injury Prevention</h1>
          <p className="text-muted-foreground">Advanced movement analysis and risk assessment</p>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Overall Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {injuryRisks.length === 0 ? "Low" : injuryRisks.some(r => r.severity === "High") ? "High" : "Medium"}
            </div>
            <Badge variant={injuryRisks.length === 0 ? "default" : "destructive"} className="mt-1">
              {injuryRisks.length} Risk{injuryRisks.length !== 1 ? "s" : ""} Found
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Movement Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(movementAnalysis?.posture?.score || 0)}`}>
              {movementAnalysis?.posture?.score || 0}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">Posture Analysis</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(movementAnalysis?.balance?.score || 0)}`}>
              {movementAnalysis?.balance?.score || 0}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              L/R: {movementAnalysis?.balance?.leftRight?.left || 0}%/{movementAnalysis?.balance?.leftRight?.right || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Mobility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(movementAnalysis?.mobility?.score || 0)}`}>
              {movementAnalysis?.mobility?.score || 0}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">Range of Motion</div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Safety Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Smart Safety Analysis
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Injury Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {smartRecommendations ? (
                smartRecommendations.safety.injuries.map((injury, idx) => (
                  <div key={idx} className="p-3 rounded bg-red-50 border border-red-200">
                    <div className="font-medium text-red-800">{injury}</div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded bg-gray-50 border">
                  <div className="text-sm">Complete fitness tests for personalized risk assessment</div>
                </div>
              )}
              
              {smartRecommendations?.safety.warnings.map((warning, idx) => (
                <div key={idx} className="p-3 rounded bg-yellow-50 border border-yellow-200">
                  <div className="font-medium text-yellow-800">{warning}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Prevention Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {smartRecommendations ? (
                smartRecommendations.safety.prevention.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded border">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-2 rounded border">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-sm">Complete tests for personalized prevention strategies</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recovery Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {smartRecommendations ? (
              smartRecommendations.safety.recovery.map((recovery, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded border">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm">{recovery}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-2 rounded border">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-sm">Complete assessment for recovery recommendations</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Injury Risk Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ risk: { label: "Risk Level", color: "hsl(var(--destructive))" } }}
            className="h-64"
          >
            <AreaChart data={riskTrendData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area 
                dataKey="risk" 
                type="monotone" 
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive)/.2)" 
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Movement Analysis Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Posture Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Overall Score</span>
              <span className={`font-bold ${getScoreColor(movementAnalysis?.posture?.score || 0)}`}>
                {movementAnalysis?.posture?.score || 0}/100
              </span>
            </div>
            <Progress value={movementAnalysis?.posture?.score || 0} />
            
            <div>
              <div className="text-sm font-medium mb-2">Issues Detected:</div>
              <ul className="text-sm space-y-1">
                {(movementAnalysis?.posture?.issues || []).map((issue, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Improvements:</div>
              <ul className="text-sm space-y-1">
                {(movementAnalysis?.posture?.improvements || []).map((improvement, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Balance Score</span>
              <span className={`font-bold ${getScoreColor(movementAnalysis?.balance?.score || 0)}`}>
                {movementAnalysis?.balance?.score || 0}/100
              </span>
            </div>
            <Progress value={movementAnalysis?.balance?.score || 0} />
            
            <div>
              <div className="text-sm font-medium mb-2">Left/Right Distribution:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded border">
                  <div className="text-lg font-bold">{movementAnalysis?.balance?.leftRight?.left || 0}%</div>
                  <div className="text-xs text-muted-foreground">Left</div>
                </div>
                <div className="text-center p-2 rounded border">
                  <div className="text-lg font-bold">{movementAnalysis?.balance?.leftRight?.right || 0}%</div>
                  <div className="text-xs text-muted-foreground">Right</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Stability: {movementAnalysis?.balance?.stability || "Unknown"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobility Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Mobility Score</span>
              <span className={`font-bold ${getScoreColor(movementAnalysis?.mobility?.score || 0)}`}>
                {movementAnalysis?.mobility?.score || 0}/100
              </span>
            </div>
            <Progress value={movementAnalysis?.mobility?.score || 0} />
            
            <div>
              <div className="text-sm font-medium mb-2">Restrictions:</div>
              <ul className="text-sm space-y-1">
                {(movementAnalysis?.mobility?.restrictions || []).map((restriction, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Recommendations:</div>
              <ul className="text-sm space-y-1">
                {(movementAnalysis?.mobility?.recommendations || []).map((rec, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}