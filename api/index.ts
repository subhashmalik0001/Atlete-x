import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { handleDemo } from "../server/routes/demo.js";
import { handleEMGData, getEMGHistory } from "../server/routes/emg.js";
import { analyzeTest, getTestHistory, getTestStats, uploadVideo } from "../server/routes/tests.js";
import { getProfile, saveProfile } from "../server/routes/profile.js";
import { getLeaderboard } from "../server/routes/leaderboard.js";
import { getTrainingPlans, saveTrainingPlan } from "../server/routes/trainingPlans.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: ping });
});

app.get("/api/demo", handleDemo);

// EMG sensor routes
app.post("/api/emg/data", handleEMGData);
app.get("/api/emg/history/:userId", getEMGHistory);

// Test analysis routes
app.post("/api/tests/analyze", uploadVideo, analyzeTest);
app.get("/api/tests/history/:userId", getTestHistory);
app.get("/api/tests/stats/:userId", getTestStats);

// Profile routes
app.get("/api/profile/:userId", getProfile);
app.post("/api/profile/:userId", saveProfile);

// Leaderboard routes
app.get("/api/leaderboard", getLeaderboard);

// Training plans routes
app.get("/api/training-plans/:userId", getTrainingPlans);
app.post("/api/training-plans/:userId", saveTrainingPlan);

// Food analysis routes
app.post("/api/food/analyze", async (req, res) => {
  const { analyzeFoodImage, uploadFoodImage } = await import("../server/routes/food.js");
  uploadFoodImage(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    analyzeFoodImage(req, res);
  });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    app(req, res, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
