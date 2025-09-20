export type Attempt = {
  id: string;
  test: "verticalJump" | "sitUps" | "pushUps" | "pullUps" | "shuttleRun" | "enduranceRun" | "flexibilityTest" | "agilityLadder" | "heightWeight";
  timestamp: number;
  data: Record<string, any>;
  formScore?: number;
  badge?: string;
  recommendations?: string[];
  emgData?: {
    muscleActivity: number;
    fatigue: number;
    activated: boolean;
  };
};

const KEY = "tt360_attempts";

export function saveAttempt(a: Attempt) {
  const list = getAttempts();
  list.unshift(a);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}

export function getAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getWeeklyCompletion(): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = getAttempts().filter((a) => a.timestamp >= weekAgo);
  const uniqueTests = new Set(recent.map((a) => a.test)).size;
  return Math.min(100, Math.round((uniqueTests / 9) * 100));
}

export function saveEMGData(emgData: { muscleActivity: number; fatigue: number; activated: boolean }) {
  const key = "athletix_emg_data";
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift({ ...emgData, timestamp: Date.now() });
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 1000)));
}

export function getEMGHistory() {
  try {
    const raw = localStorage.getItem("athletix_emg_data");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
