import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProfile, saveProfile } from "@/lib/user";
import { getAttempts } from "@/lib/storage";
import { useAuth } from "@/components/common/AuthProvider";
import { Camera, Download, Edit3, Share2, Trophy, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    id: user?.id || '',
    email: user?.email || '',
    name: user?.user_metadata?.name || '',
    age: null,
    gender: '',
    district: user?.user_metadata?.district || '',
    sport: user?.user_metadata?.sport || '',
    photoUrl: ''
  });
  
  // Load profile from database with localStorage migration
  useEffect(() => {
    if (user?.id) {
      console.log('Loading profile for user:', user.id);
      fetch(`/api/profile/${user.id}`)
        .then(res => {
          console.log('Profile API response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Profile API response:', JSON.stringify(data, null, 2));
          console.log('API response data:', data);
          if (data.success && data.profile) {
            // Profile exists in database - load it
            console.log('Loading profile from database:', data.profile);
            setProfile({
              id: user.id,
              email: data.profile.email || user?.email || '',
              name: data.profile.name || '',
              age: data.profile.age || null,
              gender: data.profile.gender || '',
              district: data.profile.district || '',
              sport: data.profile.sport || '',
              photoUrl: data.profile.photo_url || ''
            });
          } else {
            // No profile in database - use auth data as defaults
            console.log('No profile in database, using auth defaults');
            setProfile({
              id: user.id,
              email: user?.email || '',
              name: user?.user_metadata?.name || '',
              age: null,
              gender: '',
              district: user?.user_metadata?.district || '',
              sport: user?.user_metadata?.sport || '',
              photoUrl: ''
            });
          }
        })
        .catch(error => {
          console.error('Profile API error:', error);
          toast('Failed to load profile');
        });
    }
  }, [user?.id]);
  const [editing, setEditing] = useState(!profile.name);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Remove beforeunload since we're using database now

  const initials = useMemo(
    () => (profile.name ? profile.name.split(" ").map((s) => s[0]).slice(0, 2).join("") : "AX"),
    [profile.name],
  );

  const attempts = useMemo(() => getAttempts(), []);

  const stats = useMemo(() => {
    const best = {
      verticalJump: Math.max(
        0,
        ...attempts.filter((a) => a.test === "verticalJump").map((a) => Number(a.data?.jumpHeightCm || 0)),
      ),
      sitUps: Math.max(0, ...attempts.filter((a) => a.test === "sitUps").map((a) => Number(a.data?.reps || 0))),
      pushUps: Math.max(0, ...attempts.filter((a) => a.test === "pushUps").map((a) => Number(a.data?.reps || 0))),
      pullUps: Math.max(0, ...attempts.filter((a) => a.test === "pullUps").map((a) => Number(a.data?.reps || 0))),
      shuttleRun: Math.max(0, ...attempts.filter((a) => a.test === "shuttleRun").map((a) => Number(a.data?.laps || 0))),
      enduranceRun: Math.max(
        0,
        ...attempts.filter((a) => a.test === "enduranceRun").map((a) => Number(a.data?.distanceKm || 0)),
      ),
      flexibility: Math.max(0, ...attempts.filter((a) => a.test === "flexibilityTest").map((a) => Number(a.data?.reachCm || 0))),
      agility: Math.min(999, ...attempts.filter((a) => a.test === "agilityLadder").map((a) => Number(a.data?.completionTime || 999))),
    };
    const total = attempts.length;
    const last = attempts[0]?.timestamp ? new Date(attempts[0].timestamp).toLocaleString() : "—";
    return { best, total, last };
  }, [attempts]);

  const save = async () => {
    if (!user?.id) return;
    
    console.log('Saving profile with user email:', user.email);
    console.log('Full user object:', user);
    
    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          district: profile.district,
          sport: profile.sport,
          photo_url: profile.photoUrl
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setEditing(false);
        toast("Profile saved to database");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast("Failed to save profile");
    }
  };

  const share = async () => {
    const text = `AthletiX • ${profile.name || "Athlete"} • ID ${profile.id} • ${profile.sport || "Sport"}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Share card copied to clipboard");
    } catch {
      alert(text);
    }
  };

  const onPickPhoto = () => fileInputRef.current?.click();

  const onPhotoSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, photoUrl: String(reader.result) }));
      toast("Photo updated");
    };
    reader.readAsDataURL(file);
  };

  const downloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 628;
    const ctx = canvas.getContext("2d")!;

    // Background
    const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grd.addColorStop(0, "#0ea5a0");
    grd.addColorStop(1, "#38bdf8");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frame
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Inter, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("AthletiX", 60, 100);

    // Avatar circle
    const centerY = 250;
    ctx.save();
    ctx.beginPath();
    ctx.arc(160, centerY, 90, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (profile.photoUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 70, centerY - 90, 180, 180);
        ctx.restore();
        drawText();
      };
      img.crossOrigin = "anonymous";
      img.src = profile.photoUrl;
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(70, centerY - 90, 180, 180);
      ctx.restore();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(initials, 120, centerY + 22);
      drawText();
    }

    function drawText() {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(profile.name || "Athlete", 300, 220);
      ctx.font = "28px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(`${profile.sport || "Sport"} • ${profile.district || "District"}`, 300, 265);
      ctx.fillText(`ID: ${profile.id}`, 300, 305);

      ctx.font = "bold 32px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Bests", 60, 370);
      ctx.font = "28px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(`V. Jump: ${stats.best.verticalJump || 0} cm`, 60, 410);
      ctx.fillText(`Sit-ups: ${stats.best.sitUps || 0}`, 60, 445);
      ctx.fillText(`Shuttle: ${stats.best.shuttleRun || 0} laps`, 60, 480);
      ctx.fillText(`Endurance: ${stats.best.enduranceRun || 0} km`, 60, 515);

      const a = document.createElement("a");
      a.download = `AthletiX-${(profile.name || "Athlete").replace(/\s+/g, "_")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast("Downloaded share card");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profile</span>
              {!editing ? (
                <Button onClick={() => setEditing(true)} className="gap-2" variant="secondary">
                  <Edit3 className="h-4 w-4" /> Edit
                </Button>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-brand-900/40 via-brand-700/20 to-transparent p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden border grid place-content-center bg-brand-500/15">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-brand-500">{initials}</span>
                    )}
                  </div>
                  <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 gap-2" onClick={onPickPhoto}>
                    <Camera className="h-4 w-4" /> Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && onPhotoSelected(e.target.files[0])}
                  />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.name || "Athlete"}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.sport || "Sport"} • {profile.district || "District"}
                  </div>
                  <div className="mt-1 text-[10px]">ID: {profile.id}</div>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-2" onClick={share}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  <Button className="gap-2" onClick={downloadCard}>
                    <Download className="h-4 w-4" /> Download Card
                  </Button>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="text-sm text-muted-foreground">Basic details</div>
              </div>
              <div className="md:col-span-2 grid gap-4">
                <Field label="Name">
                  <Input value={profile.name} disabled={!editing} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Age">
                    <Input
                      type="number"
                      value={profile.age ?? ""}
                      disabled={!editing}
                      onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Gender">
                    <Select value={profile.gender} onValueChange={(v) => setProfile({ ...profile, gender: v as any })}>
                      <SelectTrigger disabled={!editing}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Male", "Female", "Other"].map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="District">
                    <Input
                      value={profile.district}
                      disabled={!editing}
                      onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    />
                  </Field>
                  <Field label="Sport">
                    <Input
                      value={profile.sport}
                      disabled={!editing}
                      onChange={(e) => setProfile({ ...profile, sport: e.target.value })}
                    />
                  </Field>
                </div>
                {editing ? (
                  <div className="flex gap-2">
                    <Button onClick={save}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Stats & Bests
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Attempts" value={String(stats.total)} />
            <Stat label="Last Attempt" value={stats.last} />
            <Stat label="V. Jump (cm)" value={String(stats.best.verticalJump || 0)} />
            <Stat label="Sit-ups" value={String(stats.best.sitUps || 0)} />
            <Stat label="Shuttle (laps)" value={String(stats.best.shuttleRun || 0)} />
            <Stat label="Push-ups" value={String(stats.best.pushUps || 0)} />
            <Stat label="Pull-ups" value={String(stats.best.pullUps || 0)} />
            <Stat label="Flexibility (cm)" value={String(stats.best.flexibility || 0)} />
            <Stat label="Agility (sec)" value={stats.best.agility === 999 ? "0" : String(stats.best.agility.toFixed(1))} />
            <Stat label="Avg EMG Activity" value="67.2%" />
            <Stat label="Fatigue Level" value="Low" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Good", "District Elite", "State Level", "National Standard"].map((b, i) => (
              <Badge key={b} variant={i % 2 ? "secondary" : "default"}>
                {b}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shareable Card Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border p-4 bg-gradient-to-br from-brand-900/40 via-brand-700/20 to-transparent">
              <div className="text-xs text-muted-foreground">AthletiX</div>
              <div className="text-xl font-bold">{profile.name || "Athlete"}</div>
              <div className="text-sm">{profile.sport || "Sport"} • {profile.district || "District"}</div>
              <div className="mt-2 text-[10px]">ID: {profile.id}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button className="w-full" onClick={share}>
                <Share2 className="h-4 w-4 mr-2" /> Copy as Text
              </Button>
              <Button className="w-full" variant="secondary" onClick={downloadCard}>
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
