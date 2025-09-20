import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useI18n } from "./LanguageProvider";
import { useAuth } from "./AuthProvider";
import { Activity, Apple, Bell, Dumbbell, Home, LineChart, LogOut, Medal, Settings, Shield, User, Video } from "lucide-react";

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition ${
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, t } = useI18n();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(var(--brand-700))_0%,transparent_60%),linear-gradient(180deg,hsl(var(--background))_20%,hsl(var(--brand-900)/4%)_100%)]">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-xl">
            <img src="/logo-athletix-alt.svg" alt="AthletiX logo" className="h-8 w-8" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-emerald-400 to-sky-400">
              AthletiX
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" icon={<Home className="h-4 w-4" />} label={t("dashboard")} />
            <NavItem to="/tests" icon={<Video className="h-4 w-4" />} label={t("tests")} />
            <NavItem to="/training" icon={<Dumbbell className="h-4 w-4" />} label="Training" />
            <NavItem to="/injury-prevention" icon={<Shield className="h-4 w-4" />} label="Safety" />
            <NavItem to="/nutrition" icon={<Apple className="h-4 w-4" />} label="Nutrition" />
            <NavItem to="/emg" icon={<Activity className="h-4 w-4" />} label="EMG" />
            <NavItem to="/leaderboard" icon={<Medal className="h-4 w-4" />} label={t("leaderboard")} />
            <NavItem to="/analytics" icon={<LineChart className="h-4 w-4" />} label="Analytics" />
          </nav>

          <div className="flex items-center gap-2">
            <select
              aria-label={t("language")}
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="h-9 rounded-md border bg-background px-2 text-sm"
            >
              <option value="en">EN</option>
              <option value="hi">हिं</option>
              <option value="bn">বাং</option>
            </select>
            <Link to="/notifications" aria-label={t("notifications")}
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent">
              <Bell className="h-4 w-4" />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <User className="h-4 w-4" />
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t("settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="md:hidden border-t">
          <div className="container flex items-center gap-1 py-2 overflow-x-auto">
            <NavItem to="/" icon={<Home className="h-4 w-4" />} label={t("dashboard")} />
            <NavItem to="/tests" icon={<Video className="h-4 w-4" />} label={t("tests")} />
            <NavItem to="/training" icon={<Dumbbell className="h-4 w-4" />} label="Training" />
            <NavItem to="/nutrition" icon={<Apple className="h-4 w-4" />} label="Nutrition" />
            <NavItem to="/emg" icon={<Activity className="h-4 w-4" />} label="EMG" />
            <NavItem to="/leaderboard" icon={<Medal className="h-4 w-4" />} label={t("leaderboard")} />
            <NavItem to="/notifications" icon={<Bell className="h-4 w-4" />} label={t("notifications")} />
            <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label={t("settings")} />
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">{children}</main>

      <footer className="border-t mt-8">
        <div className="container py-6 text-xs text-muted-foreground flex flex-wrap gap-2 items-center justify-between">
          <span>© {new Date().getFullYear()} AthletiX</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> PWA Ready · Offline-first
          </span>
        </div>
      </footer>
    </div>
  );
};
