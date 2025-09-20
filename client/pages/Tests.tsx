import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Watch } from "lucide-react";
import { useI18n } from "@/components/common/LanguageProvider";
import { useEMG } from "@/hooks/useEMG";
import { TestInstructions } from "@/components/TestInstructions";
import { TestCard } from "@/components/TestCard";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useVideoRecording } from "@/hooks/useVideoRecording";
import { useTestAnalysis } from "@/hooks/useTestAnalysis";
import { TestType } from "@/lib/types";
import { TEST_CONFIGS } from "@/lib/constants";
import APIService from "@/lib/api";

function RecentResults() {
  const [recentTests, setRecentTests] = useState([]);
  
  useEffect(() => {
    const loadRecentTests = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 3);
          setRecentTests(attempts);
        }
      } catch (error) {
        console.error('Failed to load recent tests:', error);
      }
    };
    loadRecentTests();
    
    const handleTestCompleted = () => {
      loadRecentTests();
    };
    
    window.addEventListener('testCompleted', handleTestCompleted);
    return () => window.removeEventListener('testCompleted', handleTestCompleted);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {recentTests.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">No recent test results</div>
        ) : (
          recentTests.map((test, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span>{test.testType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <Badge variant={test.formScore >= 80 ? "default" : test.formScore >= 60 ? "secondary" : "outline"}>
                {test.badge}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ReadinessScore() {
  const [readiness, setReadiness] = useState(0);
  
  useEffect(() => {
    const calculateReadiness = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 5);
          if (attempts.length > 0) {
            const avgScore = attempts.reduce((sum, a) => sum + a.formScore, 0) / attempts.length;
            setReadiness(Math.round(avgScore));
          }
        }
      } catch (error) {
        console.error('Failed to calculate readiness:', error);
      }
    };
    calculateReadiness();
    
    const handleTestCompleted = () => {
      calculateReadiness();
    };
    
    window.addEventListener('testCompleted', handleTestCompleted);
    return () => window.removeEventListener('testCompleted', handleTestCompleted);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={readiness} />
        <div className="mt-2 text-xs text-muted-foreground">
          {readiness > 0 ? `System calculates ${readiness}% readiness based on recent performance` : "Complete tests to see readiness score"}
        </div>
      </CardContent>
    </Card>
  );
}

const testTypes = Object.keys(TEST_CONFIGS) as TestType[];

export default function Tests() {
  const { t: translate } = useI18n();
  const [selected, setSelected] = useState<TestType>("verticalJump");
  const { emgData, device, isConnecting, connectDevice, disconnectDevice } = useEMG();
  
  // Custom hooks for video recording and analysis
  const videoRecording = useVideoRecording();
  const testAnalysis = useTestAnalysis();

  // Cleanup when switching tests
  useEffect(() => {
    videoRecording.clearVideo();
    testAnalysis.clearResult();
  }, [selected]);

  // Ensure video element shows stream when available
  useEffect(() => {
    if (videoRecording.videoRef.current && videoRecording.stream) {
      videoRecording.videoRef.current.srcObject = videoRecording.stream;
    }
  }, [videoRecording.stream]);

  // Handle video analysis
  const handleAnalyze = async () => {
    if (!videoRecording.recordedBlob) {
      alert('Please record or upload a video first');
      return;
    }

    try {
      const user = await APIService.getCurrentUser();
      if (!user) {
        alert('Please log in to analyze videos');
        return;
      }

      await testAnalysis.analyzeVideo(
        videoRecording.recordedBlob,
        selected,
        user.id
      );
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    }
  };

  const pairDevice = async () => {
    try {
      await connectDevice();
    } catch (error) {
      console.error('Failed to pair EMG device:', error);
    }
  };

  const selectedConfig = TEST_CONFIGS[selected];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedConfig.name}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Watch className="h-4 w-4" /> {selectedConfig.duration}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Tabs value={selected} onValueChange={(v) => setSelected(v as TestType)}>
              <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 w-full overflow-x-auto">
                {testTypes.map((testType) => (
                  <TabsTrigger key={testType} value={testType} className="text-xs whitespace-nowrap">
                    {TEST_CONFIGS[testType].name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {testTypes.map((testType) => (
                <TabsContent key={testType} value={testType}>
                  <TestCard
                    testType={testType}
                    videoURL={videoRecording.videoURL}
                    isRecording={videoRecording.isRecording}
                    analyzing={testAnalysis.analyzing}
                    onStartRecording={videoRecording.startRecording}
                    onStopRecording={videoRecording.stopRecording}
                    onUploadVideo={videoRecording.uploadVideo}
                    onClearVideo={videoRecording.clearVideo}
                    onAnalyze={handleAnalyze}
                    videoRef={videoRecording.videoRef}
                    stream={videoRecording.stream}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {["pushUps", "pullUps", "flexibilityTest", "agilityLadder"].includes(selected) && (
          <TestInstructions testKey={selected} />
        )}

        {testAnalysis.analyzing && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-sm text-muted-foreground">Processing biomechanics analysis...</div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {testAnalysis.result && (
          <AnalysisResults 
            analysis={testAnalysis.result} 
            emgData={device.connected ? emgData : undefined}
          />
        )}
        
        {!testAnalysis.analyzing && !testAnalysis.result && (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              Record or upload a video and click "Analyze" to get advanced performance insights
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>EMG Sensor</span>
              <span className="text-xs text-muted-foreground">{device.connected ? `Battery ${device.battery ?? "--"}%` : "Not paired"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusDot state={device.connected ? "connected" : isConnecting ? "connecting" : "disconnected"} />
              <span className="text-sm">{device.connected ? "Connected" : isConnecting ? "Connecting" : "Disconnected"}</span>
            </div>
            <Button onClick={device.connected ? disconnectDevice : pairDevice} variant={device.connected ? "secondary" : "default"} className="gap-2" disabled={isConnecting}>
              <Watch className="h-4 w-4" /> {device.connected ? "Disconnect" : "Pair"} EMG Sensor
            </Button>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Live Metrics</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric label="Muscle Activity" value={`${emgData.muscleActivity.toFixed(1)}%`} />
                <Metric label="Fatigue Level" value={`${emgData.fatigue.toFixed(1)}%`} />
                <Metric label="Status" value={emgData.activated ? "ACTIVE" : "REST"} />
              </div>
            </div>
          </CardContent>
        </Card>

        <RecentResults />

        <ReadinessScore />
      </div>
    </div>
  );
}

function StatusDot({ state }: { state: "disconnected" | "connecting" | "connected" }) {
  const color = state === "connected" ? "bg-emerald-400" : state === "connecting" ? "bg-amber-400" : "bg-gray-400";
  return <span className={`h-2.5 w-2.5 rounded-full ${color} animate-pulse`} />;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}


