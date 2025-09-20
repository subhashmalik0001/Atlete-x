export type Profile = {
  id: string;
  name: string;
  age: number | null;
  gender: "Male" | "Female" | "Other" | "";
  district: string;
  sport: string;
  photoUrl?: string;
};

export type AppSettings = {
  theme: "system" | "light" | "dark";
  voiceGuidance: boolean;
  notifications: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: number;
  read: boolean;
  type?: "info" | "rank" | "update" | "trial";
};

// Make storage keys user-specific
function getUserKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}_${userId}` : baseKey;
}

const KEY_PROFILE = "tt360_profile";
const KEY_SETTINGS = "tt360_settings";
const KEY_NOTIFS = "tt360_notifications";

export function getOrCreateId(): string {
  const existing = localStorage.getItem("tt360_athlete_id");
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem("tt360_athlete_id", id);
  return id;
}

export function getProfile(userId?: string): Profile {
  try {
    const key = getUserKey(KEY_PROFILE, userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { id: userId || getOrCreateId(), name: "", age: null, gender: "", district: "", sport: "" };
}

export function saveProfile(p: Profile, userId?: string) {
  const key = getUserKey(KEY_PROFILE, userId);
  localStorage.setItem(key, JSON.stringify(p));
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { theme: "system", voiceGuidance: false, notifications: true };
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
}

export function getNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(KEY_NOTIFS);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed with a few notifications
  const seed: NotificationItem[] = [
    { id: crypto.randomUUID(), title: "New Test", message: "Agility Ladder test is now available.", date: Date.now() - 3600e3, read: false, type: "update" },
    { id: crypto.randomUUID(), title: "Rank Up", message: "You moved to #12 in District.", date: Date.now() - 7200e3, read: false, type: "rank" },
    { id: crypto.randomUUID(), title: "Trials", message: "District trials open next week.", date: Date.now() - 86400e3, read: true, type: "trial" },
  ];
  localStorage.setItem(KEY_NOTIFS, JSON.stringify(seed));
  return seed;
}

export function saveNotifications(list: NotificationItem[]) {
  localStorage.setItem(KEY_NOTIFS, JSON.stringify(list));
}

export function markAllRead() {
  const list = getNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(list);
  return list;
}
