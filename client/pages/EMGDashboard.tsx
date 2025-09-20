import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { useEMG } from "@/hooks/useEMG";
import { getEMGHistory } from "@/lib/storage";
import { Activity, Battery, Bluetooth, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function EMGDashboard() {
  const { emgData, device, isConnecting, connectDevice, disconnectDevice } = useEMG();
  const emgHistory = useMemo(() => getEMGHistory().slice(0, 20), []);

  const chartData = useMemo(() => {
    return emgHistory.map((reading, index) => ({
      time: `${index + 1}m`,
      muscleActivity: reading.muscleActivity,
      fatigue: reading.fatigue
    }));
  }, [emgHistory]);

  const getActivityLevel = (activity: number) => {
    if (activity > 70) return { level: "High", color: "bg-red-500" };
    if (activity > 40) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "Low", color: "bg-green-500" };
  };

  const getFatigueStatus = (fatigue: number) => {
    if (fatigue > 70) return { status: "High Risk", variant: "destructive" as const };
    if (fatigue > 40) return { status: "Moderate", variant: "secondary" as const };
    return { status: "Low", variant: "default" as const };
  };

  const activityLevel = getActivityLevel(emgData.muscleActivity);
  const fatigueStatus = getFatigueStatus(emgData.fatigue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">EMG Dashboard</h1>
          <p className="text-muted-foreground">Real-time muscle activity monitoring</p>
        </div>
        <Button 
          onClick={device.connected ? disconnectDevice : connectDevice}
          variant={device.connected ? "secondary" : "default"}
          disabled={isConnecting}
          className="gap-2"
        >
          <Bluetooth className="h-4 w-4" />
          {device.connected ? "Disconnect" : isConnecting ? "Connecting..." : "Connect EMG"}
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Muscle Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emgData.muscleActivity.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-2 rounded-full ${activityLevel.color}`} />
              <span className="text-xs text-muted-foreground">{activityLevel.level}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fatigue Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emgData.fatigue.toFixed(1)}%</div>
            <Badge variant={fatigueStatus.variant} className="mt-1">
              {fatigueStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Activation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emgData.activated ? "ACTIVE" : "REST"}</div>
            <div className={`h-2 w-full rounded-full mt-2 ${emgData.activated ? "bg-green-500" : "bg-gray-300"}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Device Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.connected ? "Connected" : "Offline"}</div>
            {device.battery && (
              <div className="text-xs text-muted-foreground mt-1">
                Battery: {device.battery}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Muscle Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ muscleActivity: { label: "Activity %", color: "hsl(var(--brand-500))" } }}
              className="h-64"
            >
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area 
                  dataKey="muscleActivity" 
                  type="monotone" 
                  stroke="hsl(var(--brand-500))" 
                  fill="hsl(var(--brand-500)/.2)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fatigue Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ fatigue: { label: "Fatigue %", color: "hsl(var(--destructive))" } }}
              className="h-64"
            >
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line 
                  dataKey="fatigue" 
                  type="monotone" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {emgData.fatigue > 70 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
              <div className="font-medium text-red-800 dark:text-red-200">High Fatigue Detected</div>
              <div className="text-sm text-red-600 dark:text-red-300">Consider taking a rest break to prevent injury.</div>
            </div>
          )}
          
          {emgData.muscleActivity < 30 && device.connected && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">Low Muscle Activation</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-300">Check sensor placement or increase exercise intensity.</div>
            </div>
          )}
          
          {emgData.muscleActivity > 80 && emgData.fatigue < 40 && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
              <div className="font-medium text-green-800 dark:text-green-200">Optimal Performance</div>
              <div className="text-sm text-green-600 dark:text-green-300">Great muscle activation with low fatigue. Keep it up!</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/tests">Start Test Session</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/analytics">View Analytics</Link>
          </Button>
          <Button variant="outline">
            Export EMG Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}