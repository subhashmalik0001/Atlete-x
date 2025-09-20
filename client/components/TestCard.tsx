// Reusable Test Card Component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Upload, Square, RefreshCcw, Play } from 'lucide-react';
import { TestType } from '@/lib/types';
import { TEST_CONFIGS } from '@/lib/constants';

interface TestCardProps {
  testType: TestType;
  videoURL: string | null;
  isRecording: boolean;
  analyzing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onUploadVideo: (file: File) => void;
  onClearVideo: () => void;
  onAnalyze: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
}

export function TestCard({
  testType,
  videoURL,
  isRecording,
  analyzing,
  onStartRecording,
  onStopRecording,
  onUploadVideo,
  onClearVideo,
  onAnalyze,
  videoRef,
  stream
}: TestCardProps) {
  const config = TEST_CONFIGS[testType];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{config.name}</span>
          <Badge variant="outline">{config.duration}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Preview */}
        <div className="relative">
          {!videoURL && !stream ? (
            <div className="aspect-video rounded-lg bg-gradient-to-br from-brand-900/20 via-brand-700/10 to-transparent border grid place-content-center text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Setup</div>
                <p className="font-medium">{config.setup}</p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Record or upload video to analyze
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <video 
                ref={videoRef} 
                src={!stream ? videoURL : undefined}
                controls={!stream} 
                className="w-full rounded-lg border" 
                muted
                autoPlay
                playsInline
              />
              <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-1 rounded">
                AthletiX · {new Date().toLocaleString()}
              </div>
              {isRecording && (
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Recording
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={isRecording ? onStopRecording : onStartRecording} 
            variant={isRecording ? "destructive" : "default"} 
            className="gap-2"
          >
            {isRecording ? (
              <><Square className="h-4 w-4" /> Stop Recording</>
            ) : (
              <><Video className="h-4 w-4" /> Record</>
            )}
          </Button>
          
          <label className="inline-flex">
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadVideo(e.target.files[0]);
                }
              }} 
            />
            <Button variant="outline" className="gap-2" asChild>
              <span><Upload className="h-4 w-4" /> Upload</span>
            </Button>
          </label>
          
          {videoURL && (
            <Button variant="outline" onClick={onClearVideo} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* Quality Checks */}
        <div>
          <div className="text-sm mb-1">Quality Checklist</div>
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
            <li>Ensure good lighting</li>
            <li>Keep full body in frame</li>
            <li>Stable camera position</li>
            <li>Clear view of movement</li>
          </ul>
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={onAnalyze} 
          disabled={!videoURL || analyzing}
          className="w-full gap-2"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 
              Analyzing...
            </>
          ) : (
            <><Play className="h-4 w-4" /> Analyze Performance</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}