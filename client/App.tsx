import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// react-query removed temporarily — re-add when debugging hooks issue
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Tests from "./pages/Tests";
import Analytics from "./pages/Analytics";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import { LanguageProvider } from "@/components/common/LanguageProvider";
import { AuthProvider } from "@/components/common/AuthProvider";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { Layout } from "@/components/common/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EMGDashboard from "./pages/EMGDashboard";
import TrainingPlans from "./pages/TrainingPlans";
import InjuryPrevention from "./pages/InjuryPrevention";
import Nutrition from "./pages/Nutrition";

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/emg" element={<EMGDashboard />} />
                    <Route path="/training" element={<TrainingPlans />} />
                    <Route path="/injury-prevention" element={<InjuryPrevention />} />
                    <Route path="/nutrition" element={<Nutrition />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </LanguageProvider>
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
