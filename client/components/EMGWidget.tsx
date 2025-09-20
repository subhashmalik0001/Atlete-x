import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEMG } from "@/hooks/useEMG";

export const EMGWidget: React.FC = () => {
  const { emgData, device } = useEMG();

  if (!device.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            EMG Sensor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            Connect EMG sensor for muscle monitoring
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/emg">Connect Sensor</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (value: number, type: 'activity' | 'fatigue') => {
    if (type === 'activity') {
      return value > 70 ? 'text-green-600' : value > 40 ? 'text-yellow-600' : 'text-red-600';
    } else {
      return value > 70 ? 'text-red-600' : value > 40 ? 'text-yellow-600' : 'text-green-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-500" />
          EMG Live Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Activity</div>
            <div className={`text-lg font-bold ${getStatusColor(emgData.muscleActivity, 'activity')}`}>
              {emgData.muscleActivity.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Fatigue</div>
            <div className={`text-lg font-bold ${getStatusColor(emgData.fatigue, 'fatigue')}`}>
              {emgData.fatigue.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${emgData.activated ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs">{emgData.activated ? 'Active' : 'Rest'}</span>
          </div>
          {emgData.fatigue > 70 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              High Fatigue
            </Badge>
          )}
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/emg">
            <TrendingUp className="h-3 w-3 mr-1" />
            View Dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};