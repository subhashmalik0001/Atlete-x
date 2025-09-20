import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getWeeklyCompletion } from "@/lib/storage";
import { Dumbbell, Medal, Rocket, Sparkles, Trophy, Upload, Video, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/components/common/LanguageProvider";
import { EMGWidget } from "@/components/EMGWidget";
import { FeatureCards } from "@/components/FeatureCards";

const trends = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 50 },
  { day: "Thu", value: 65 },
  { day: "Fri", value: 70 },
  { day: "Sat", value: 85 },
  { day: "Sun", value: 90 },
];

export default function Index() {
  const { t } = useI18n();
  const completion = useMemo(() => getWeeklyCompletion(), []);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-900/40 via-brand-700/20 to-transparent p-6 md:p-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(14,165,160,0.45)]">
              {t("greeting")}, Athlete! Crush your goals this week.
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-prose">
              Advanced biomechanics analysis, real-time performance feedback, and competitive rankings.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild className="gap-2"><Link to="/tests"><Video className="h-4 w-4" /> {t("startTest")}</Link></Button>
              <Button variant="secondary" className="gap-2" asChild><Link to="/tests"><Upload className="h-4 w-4" /> Upload Video</Link></Button>
            </div>
          </div>
          <div className="rounded-xl border bg-background/60 p-4">
            <div className="text-sm mb-2">{t("progressThisWeek")}</div>
            <Progress value={completion} />
            <div className="mt-2 text-xs text-muted-foreground">{completion}% completed · Keep going!</div>
            <div className="mt-4">
              <ChartContainer
                config={{ value: { label: "Score", color: "hsl(var(--brand-500))" } }}
                className="h-40"
              >
                <AreaChart data={trends}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area dataKey="value" type="monotone" stroke="hsl(var(--brand-500))" fill="hsl(var(--brand-500)/.2)" />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-500" /> {t("quickStart")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { to: "/training", label: "Smart Training", icon: <Dumbbell className="h-4 w-4" /> },
              { to: "/injury-prevention", label: "Safety Check", icon: <Trophy className="h-4 w-4" /> },
              { to: "/nutrition", label: "Nutrition", icon: <Sparkles className="h-4 w-4" /> },
              { to: "/tests", label: "Quick Test", icon: <Rocket className="h-4 w-4" /> },
              { to: "/emg", label: "EMG Monitor", icon: <Medal className="h-4 w-4" /> },
            ].map((b) => (
              <Button key={b.label} variant="outline" asChild className="justify-start gap-2">
                <Link to={b.to}>{b.icon}{b.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Medal className="h-4 w-4 text-amber-500" /> {t("achievements")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Good", "District Elite", "State Level", "National Standard"].map((b, i) => (
              <Badge key={i} variant={i % 2 ? "secondary" : "default"}>{b}</Badge>
            ))}
          </CardContent>
        </Card>

        <EMGWidget />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">New Features</h2>
        <FeatureCards />
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Score", color: "hsl(var(--brand-500))" } }}
              className="h-64"
            >
              <AreaChart data={trends}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis hide />
                <ChartLegend content={<ChartLegendContent />} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area dataKey="value" type="monotone" stroke="hsl(var(--brand-500))" fill="hsl(var(--brand-500)/.2)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="rounded-md border p-2">New test available: Agility Ladder</div>
            <div className="rounded-md border p-2">You moved to rank #12 in District</div>
            <div className="rounded-md border p-2">Trial shortlist opens next week</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
