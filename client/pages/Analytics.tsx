import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { ComprehensiveReport } from "@/components/ComprehensiveReport";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const TESTS = [
  { key: "verticalJump", label: "Vertical Jump", unit: "cm", field: "jumpHeightCm" },
  { key: "sitUps", label: "Sit-ups", unit: "reps", field: "reps" },
  { key: "pushUps", label: "Push-ups", unit: "reps", field: "reps" },
  { key: "pullUps", label: "Pull-ups", unit: "reps", field: "reps" },
  { key: "shuttleRun", label: "Shuttle Run", unit: "laps", field: "laps" },
  { key: "enduranceRun", label: "Endurance Run", unit: "km", field: "distanceKm" },
  { key: "flexibilityTest", label: "Flexibility", unit: "cm", field: "reachCm" },
  { key: "agilityLadder", label: "Agility", unit: "sec", field: "completionTime" },
  { key: "heightWeight", label: "Height/Weight", unit: "cm", field: "heightCm" },
] as const;

type TestKey = typeof TESTS[number]["key"];

type Point = { date: string; value: number };

type Bench = { label: string; value: number };

const BENCHMARKS: Record<TestKey, Bench[]> = {
  verticalJump: [
    { label: "Good", value: 35 },
    { label: "District Elite", value: 45 },
    { label: "State Level", value: 55 },
    { label: "National Standard", value: 65 },
  ],
  sitUps: [
    { label: "Good", value: 20 },
    { label: "District Elite", value: 35 },
    { label: "State Level", value: 45 },
    { label: "National Standard", value: 55 },
  ],
  pushUps: [
    { label: "Good", value: 15 },
    { label: "District Elite", value: 25 },
    { label: "State Level", value: 35 },
    { label: "National Standard", value: 45 },
  ],
  pullUps: [
    { label: "Good", value: 5 },
    { label: "District Elite", value: 10 },
    { label: "State Level", value: 15 },
    { label: "National Standard", value: 20 },
  ],
  shuttleRun: [
    { label: "Good", value: 8 },
    { label: "District Elite", value: 12 },
    { label: "State Level", value: 16 },
    { label: "National Standard", value: 20 },
  ],
  enduranceRun: [
    { label: "Good", value: 2 },
    { label: "District Elite", value: 3 },
    { label: "State Level", value: 4 },
    { label: "National Standard", value: 5 },
  ],
  flexibilityTest: [
    { label: "Good", value: 15 },
    { label: "District Elite", value: 25 },
    { label: "State Level", value: 35 },
    { label: "National Standard", value: 45 },
  ],
  agilityLadder: [
    { label: "Good", value: 12 },
    { label: "District Elite", value: 10 },
    { label: "State Level", value: 8 },
    { label: "National Standard", value: 6 },
  ],
  heightWeight: [
    { label: "Good", value: 160 },
    { label: "District Elite", value: 170 },
    { label: "State Level", value: 180 },
    { label: "National Standard", value: 190 },
  ],
};

export default function Analytics() {
  const [active, setActive] = useState<TestKey>("verticalJump");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch test data from database only
  const fetchTestData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAttempts([]);
        return;
      }
      
      const response = await fetch(`/api/tests/history/${user.id}?limit=50`);
      console.log('Fetching database data for user:', user.id);
      if (response.ok) {
        const data = await response.json();
        setAttempts(data.attempts || []);
        console.log('Fetched database data:', data.attempts?.length || 0, 'attempts');
      } else {
        setAttempts([]);
      }
    } catch (error) {
      console.error('Failed to fetch database data:', error);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTestData();
  }, []);
  
  // Auto-refresh when returning to analytics page
  useEffect(() => {
    const handleFocus = () => fetchTestData();
    const handleTestCompleted = () => {
      console.log('Test completed, refreshing analytics...');
      setTimeout(fetchTestData, 1000); // Small delay to ensure data is saved
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('testCompleted', handleTestCompleted);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('testCompleted', handleTestCompleted);
    };
  }, []);
  
  // Sort database data by creation date
  const sortedAttempts = useMemo(() => {
    return attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [attempts]);

  const series = useMemo<Point[]>(() => {
    const meta = TESTS.find((t) => t.key === active)!;
    console.log(`Analytics for ${active}:`, { meta, attempts: sortedAttempts.length });
    
    const points = sortedAttempts
      .filter((a) => a.testType === active)
      .map((a) => {
        const metrics = a.metrics || {};
        console.log('Processing attempt:', { 
          testType: a.test || a.testType, 
          metrics, 
          field: meta.field, 
          value: metrics[meta.field],
          formScore: a.formScore || a.form_score
        });
        return {
          date: new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          value: Number(metrics[meta.field] ?? 0),
          formScore: a.formScore || 0,
          performanceAnalysis: a.analysisResult
        };
      })
      .filter((d) => !Number.isNaN(d.value) && d.value > 0)
      .reverse();
    
    console.log('Final points for graph:', points);
    
    return points; // Only return real data, no mock data
  }, [sortedAttempts, active]);

  const meta = TESTS.find((t) => t.key === active)!;
  const last = series.at(-1)?.value ?? 0;
  const best = Math.max(...series.map((p) => p.value));
  const avg7 = Math.round(series.slice(-7).reduce((s, p) => s + p.value, 0) / Math.min(7, series.length));
  const avgFormScore = Math.round(series.slice(-7).reduce((s, p) => s + (p.formScore || 0), 0) / Math.min(7, series.length));
  const trendSlope = linearSlope(series.map((p, i) => [i, p.value]));
  const projection = Math.round(last + trendSlope * 8);
  
  // Performance Analysis insights
  const performanceInsights = useMemo(() => {
    const recentAttempts = sortedAttempts.filter(a => a.testType === active).slice(0, 5);
    const recommendations = new Set<string>();
    const commonIssues = new Set<string>();
    
    recentAttempts.forEach(attempt => {
      if (attempt.recommendations) {
        attempt.recommendations.forEach((rec: string) => recommendations.add(rec));
      }
      if (attempt.analysisResult?.errors) {
        attempt.analysisResult.errors.forEach((error: string) => commonIssues.add(error));
      }
    });
    
    return {
      recommendations: Array.from(recommendations).slice(0, 3),
      issues: Array.from(commonIssues).slice(0, 2),
      improvementTrend: trendSlope > 0 ? 'improving' : trendSlope < 0 ? 'declining' : 'stable'
    };
  }, [sortedAttempts, active, trendSlope]);

  const bench = BENCHMARKS[active];
  const nextTarget = bench.find((b) => b.value > last) ?? bench.at(-1)!;

  const mini = useMemo(() =>
    TESTS.map((t) => ({
      key: t.key,
      label: t.label,
      unit: t.unit,
      data: sortedAttempts
        .filter((a) => a.testType === t.key)
        .map((a) => ({ x: new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }), y: Number(a.metrics?.[t.field] ?? 0) }))
        .filter((d) => d.y > 0)
        .slice(-6),
    })),
  [sortedAttempts]);

  return (
    <Tabs defaultValue="analytics" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        <TabsTrigger value="report">Comprehensive Report</TabsTrigger>
      </TabsList>
      
      <TabsContent value="analytics">
        <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Athlete Analytics</span>
              <Tabs value={active} onValueChange={(v) => setActive(v as TestKey)}>
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 overflow-x-auto">
                  {TESTS.map((t) => (
                    <TabsTrigger key={t.key} value={t.key} className="text-xs whitespace-nowrap">
                      {t.label.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            {series.length > 0 ? (
              <>
                <Stat title="Personal Best" value={`${best} ${meta.unit}`} />
                <Stat title="Last Attempt" value={`${last} ${meta.unit}`} />
                <Stat title="Avg Form Score" value={`${avgFormScore || 0}/100`} />
                <Stat title="Performance Trend" value={performanceInsights.improvementTrend} />
              </>
            ) : (
              <>
                <Stat title="Personal Best" value="No data" />
                <Stat title="Last Attempt" value="No data" />
                <Stat title="Avg Form Score" value="No data" />
                <Stat title="Performance Trend" value="No data" />
              </>
            )}
            <div className="md:col-span-4">
              {series.length > 0 ? (
                <ChartContainer 
                  config={{ 
                    value: { label: meta.label, color: "hsl(var(--brand-500))" },
                    formScore: { label: "Form Score", color: "hsl(var(--emerald-500))" }
                  }} 
                  className="h-64"
                >
                  <LineChart data={series}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line dataKey="value" type="monotone" stroke="hsl(var(--brand-500))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line dataKey="formScore" type="monotone" stroke="hsl(var(--emerald-500))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-64 border rounded-lg flex items-center justify-center text-muted-foreground">
                  No test data available for {meta.label}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {series.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Form Analysis</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Form Score Trend</div>
                <ChartContainer 
                  config={{ formScore: { label: "Form Score", color: "hsl(var(--emerald-500))" } }} 
                  className="h-48"
                >
                  <AreaChart data={series.slice(-10)}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Area 
                      dataKey="formScore" 
                      type="monotone" 
                      stroke="hsl(var(--emerald-500))" 
                      fill="hsl(var(--emerald-500)/.2)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Current Form Score</div>
                  <div className="text-3xl font-bold text-emerald-600">{avgFormScore}/100</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Performance vs Form</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded border">
                      <div className="text-lg font-semibold">{last}</div>
                      <div className="text-xs text-muted-foreground">Performance</div>
                    </div>
                    <div className="p-2 rounded border">
                      <div className="text-lg font-semibold">{series.at(-1)?.formScore?.toFixed(0) || 0}</div>
                      <div className="text-xs text-muted-foreground">Form Score</div>
                    </div>
                  </div>
                </div>
                
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/tests">Improve Form</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {series.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Comparison</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <ChartContainer config={{ you: { label: "You", color: "hsl(var(--brand-500))" } }} className="h-64">
                  <BarChart data={bench.map((b) => ({ name: b.label, target: b.value, you: last }))}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="target" fill="hsl(var(--muted-foreground)/.3)" radius={6} />
                    <Bar dataKey="you" fill="hsl(var(--brand-500))" radius={6} />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Next target</div>
                <div className="text-2xl font-semibold">{nextTarget.label}</div>
                <div className="text-sm">Reach {nextTarget.value} {meta.unit}. You're at {last}.</div>
                <Button asChild variant="secondary" className="mt-2"><Link to="/tests">Practice now</Link></Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6">
        {sortedAttempts.some(a => a.emgData) ? (
          <Card>
            <CardHeader>
              <CardTitle>EMG Muscle Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Real EMG data from connected sensor
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>EMG Sensor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-4">
                Connect EMG sensor during tests to see muscle analysis data
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading performance insights...</div>
            ) : (
              <>
                {performanceInsights.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Expert Recommendations:</div>
                    <div className="space-y-2">
                      {performanceInsights.recommendations.map((rec, idx) => (
                        <Suggestion key={idx} text={rec} type="recommendation" />
                      ))}
                    </div>
                  </div>
                )}
                
                {performanceInsights.issues.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Common Issues:</div>
                    <div className="space-y-2">
                      {performanceInsights.issues.map((issue, idx) => (
                        <Suggestion key={idx} text={issue} type="warning" />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">
                    Performance Trend: {performanceInsights.improvementTrend}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {performanceInsights.improvementTrend === 'improving' && 'Keep up the great work! Your form is getting better.'}
                    {performanceInsights.improvementTrend === 'declining' && 'Focus on technique over speed. Consider rest or form practice.'}
                    {performanceInsights.improvementTrend === 'stable' && 'Consistent performance. Try varying intensity to improve.'}
                  </div>
                </div>
                
                {performanceInsights.recommendations.length === 0 && performanceInsights.issues.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Complete more performance tests to get personalized insights.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mini Trends</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            {mini.map((m) => (
              <div key={m.key} className="rounded-lg border p-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{m.label}</span>
                  {m.data.length ? <Badge variant="secondary">{m.data.at(-1)!.y} {TESTS.find(t=>t.key===m.key)!.unit}</Badge> : <Badge variant="outline">No data</Badge>}
                </div>
                <ChartContainer config={{ y: { label: m.label, color: "hsl(var(--brand-400))" } }} className="h-20">
                  <AreaChart data={m.data.map((d) => ({ date: d.x, value: d.y }))}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Area dataKey="value" type="monotone" stroke="hsl(var(--brand-400))" fill="hsl(var(--brand-400)/.2)" />
                  </AreaChart>
                </ChartContainer>
              </div>
            ))}
          </CardContent>
        </Card>

        {!sortedAttempts.length && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              No attempts yet. Head to Tests to record your first assessment.
              <div className="mt-3"><Button asChild><Link to="/tests">Go to Tests</Link></Button></div>
            </CardContent>
          </Card>
        )}
        </div>
        </div>
      </TabsContent>
      
      <TabsContent value="report">
        <ComprehensiveReport />
      </TabsContent>
    </Tabs>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function linearSlope(points: Array<[number, number]>): number {
  const n = points.length;
  if (n < 2) return 0;
  const sumX = points.reduce((s, [x]) => s + x, 0);
  const sumY = points.reduce((s, [, y]) => s + y, 0);
  const sumXY = points.reduce((s, [x, y]) => s + x * y, 0);
  const sumXX = points.reduce((s, [x]) => s + x * x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (!denom) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function Suggestion({ text, type = "recommendation" }: { text: string; type?: "recommendation" | "warning" }) {
  const bgColor = type === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200";
  const textColor = type === "warning" ? "text-yellow-800" : "text-green-800";
  
  return (
    <div className={`rounded-md border p-2 ${bgColor}`}>
      <div className={`text-sm ${textColor}`}>{text}</div>
    </div>
  );
}
