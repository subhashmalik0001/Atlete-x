import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSettings, saveSettings } from "@/lib/user";

export default function Settings() {
  const [theme, setTheme] = useState(getSettings().theme);
  const [voice, setVoice] = useState(getSettings().voiceGuidance);
  const [notif, setNotif] = useState(getSettings().notifications);

  useEffect(() => {
    const s = { theme, voiceGuidance: voice, notifications: notif };
    saveSettings(s);
    applyTheme(theme);
  }, [theme, voice, notif]);

  const install = async () => {
    alert("Install prompt will appear if supported. On mobile, use Add to Home Screen.");
  };

  const clearData = () => {
    if (confirm("Clear cached attempts and notifications?")) {
      localStorage.removeItem("tt360_attempts");
      localStorage.removeItem("tt360_notifications");
      alert("Cleared.");
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 max-w-md">
          <div className="grid gap-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v)=>setTheme(v as any)}>
              <SelectTrigger><SelectValue placeholder="Theme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 max-w-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Voice guidance</div>
              <div className="text-sm text-muted-foreground">Pose-based live coaching voice prompts</div>
            </div>
            <Switch checked={voice} onCheckedChange={setVoice} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notifications</div>
              <div className="text-sm text-muted-foreground">Alerts for tests, ranks, and trials</div>
            </div>
            <Switch checked={notif} onCheckedChange={setNotif} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={install}>Install PWA</Button>
          <Button variant="outline" onClick={clearData}>Clear cached data</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function applyTheme(theme: "system"|"light"|"dark") {
  const root = document.documentElement;
  if (theme === "system") {
    root.classList.toggle("dark", window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    return;
  }
  root.classList.toggle("dark", theme === "dark");
}
