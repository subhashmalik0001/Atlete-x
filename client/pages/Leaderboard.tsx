import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Filter, MapPin, Medal, Trophy, User } from "lucide-react";
import { Link } from "react-router-dom";
import APIService from "@/lib/api";

const SPORTS = ["All", "Athletics", "Football", "Basketball", "Volleyball", "Kabaddi"] as const;

interface LeaderboardEntry {
  userId: string;
  name: string;
  district: string;
  state: string;
  sport: string;
  score: number;
  badge: string;
  rank: number;
}

export default function Leaderboard() {
  const [level, setLevel] = useState<"district" | "state" | "national">("district");
  const [sport, setSport] = useState<typeof SPORTS[number]>("All");
  const [district, setDistrict] = useState("Patna");
  const [state, setState] = useState("Bihar");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await APIService.getCurrentUser();
        setCurrentUserId(user?.id || null);
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const region = level === 'district' ? district : level === 'state' ? state : undefined;
        const data = await APIService.getLeaderboard(level, sport, region);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [level, sport, district, state]);

  const yourIndex = leaderboardData.findIndex((r) => r.userId === currentUserId);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Leaderboards</span>
              <Tabs value={level} onValueChange={(v) => setLevel(v as any)}>
                <TabsList>
                  <TabsTrigger value="district"><MapPin className="h-4 w-4 mr-1" /> District</TabsTrigger>
                  <TabsTrigger value="state">State</TabsTrigger>
                  <TabsTrigger value="national"><Crown className="h-4 w-4 mr-1" /> National</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" /> Filters</div>
              <Select value={sport} onValueChange={(v) => setSport(v as any)}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sport" /></SelectTrigger>
                <SelectContent>
                  {SPORTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {level === "district" && (
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="District" /></SelectTrigger>
                  <SelectContent>
                    {["Patna", "Gaya", "Kolkata", "Ranchi", "Dhanbad"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {level === "state" && (
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    {["Bihar", "Jharkhand", "West Bengal"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Athlete</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Badge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading leaderboard...
                    </TableCell>
                  </TableRow>
                ) : leaderboardData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No data available. Complete some tests to appear on the leaderboard!
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboardData.map((row, idx) => (
                    <TableRow key={row.userId} className={row.userId === currentUserId ? "bg-emerald-50/60 dark:bg-emerald-400/10" : undefined}>
                      <TableCell>
                        <div className="inline-flex items-center gap-2">
                          <span className="font-mono">#{row.rank}</span>
                          {idx < 3 && <Medal className={`h-4 w-4 ${idx===0?"text-amber-500":idx===1?"text-gray-400":"text-amber-700"}`} />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20 text-brand-500"><User className="h-3.5 w-3.5" /></span>
                        {row.userId === currentUserId ? "You" : row.name}
                      </TableCell>
                      <TableCell>{level === "district" ? row.district : level === "state" ? row.state : `${row.district}, ${row.state}`}</TableCell>
                      <TableCell>{row.sport}</TableCell>
                      <TableCell className="text-right font-semibold">{row.score}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.badge.includes("National")?"default":row.badge.includes("State")?"secondary":"outline"}>{row.badge}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Standing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {yourIndex >= 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Current Rank</span>
                  <span className="font-semibold">#{leaderboardData[yourIndex].rank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Score</span>
                  <span className="font-semibold">{leaderboardData[yourIndex].score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Badge</span>
                  <Badge>{leaderboardData[yourIndex].badge}</Badge>
                </div>
                <div className="pt-2"><Button asChild className="w-full"><Link to="/tests">Improve Now</Link></Button></div>
              </>
            ) : (
              <>
                <div>No rank yet. Record your first attempt to enter the leaderboard.</div>
                <div className="pt-2"><Button asChild className="w-full"><Link to="/tests">Go to Tests</Link></Button></div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rules</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>• Scores update after performance verification.</div>
            <div>• Suspicious uploads may be removed.</div>
            <div>• Ties are broken by latest achievement.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
