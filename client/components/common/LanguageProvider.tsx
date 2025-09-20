import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "hi" | "bn";

type Dictionary = Record<string, Record<Language, string>>;

const dictionary: Dictionary = {
  appName: { en: "AthletiX", hi: "AthletiX", bn: "AthletiX" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", bn: "ড্যাশবোর্ড" },
  tests: { en: "Tests", hi: "परीक्षण", bn: "পরীক্ষা" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल", bn: "প্রোফাইল" },
  leaderboard: { en: "Leaderboards", hi: "लीडरबोर्ड", bn: "লিডারবোর্ড" },
  notifications: { en: "Notifications", hi: "सूचनाएँ", bn: "বিজ্ঞপ্তি" },
  settings: { en: "Settings", hi: "सेटिंग्स", bn: "সেটিংস" },
  greeting: { en: "Welcome", hi: "स्वागत है", bn: "স্বাগতম" },
  startTest: { en: "Start Test", hi: "टेस्ट शुरू करें", bn: "টেস্ট শুরু করুন" },
  quickStart: { en: "Quick Start", hi: "त्वरित प्रारंभ", bn: "দ্রুত শুরু" },
  progressThisWeek: { en: "This Week's Completion", hi: "इस सप्ताह की प्रगति", bn: "এই সপ্তাহের অগ্রগতি" },
  achievements: { en: "Achievements", hi: "उपलब्धियाँ", bn: "অর্জন" },
  badges: { en: "Badges", hi: "बैज", bn: "ব্যাজ" },
  verticalJump: { en: "Vertical Jump", hi: "वर्टिकल जंप", bn: "ভার্টিকাল জাম্প" },
  sitUps: { en: "Sit-ups", hi: "सिट-अप्स", bn: "সিট-আপস" },
  shuttleRun: { en: "Shuttle Run", hi: "शटल रन", bn: "শাটল রান" },
  enduranceRun: { en: "Endurance Run", hi: "एंड्यूरेंस रन", bn: "এন্ডুরেন্স রান" },
  heightWeight: { en: "Height/Weight", hi: "ऊंचाई/वज़न", bn: "উচ্চতা/ওজন" },
  language: { en: "Language", hi: "भाषा", bn: "ভাষা" },
  installApp: { en: "Install App", hi: "ऐप इंस्टॉल करें", bn: "অ্যাপ ইনস্টল" },
  streak: { en: "Streak", hi: "स्ट्रिक", bn: "স্ট্রিক" },
  recent: { en: "Recent", hi: "हालिया", bn: "সাম্প্রতিক" },
  pairDevice: { en: "Pair TalentBand", hi: "टैलेंटबैंड जोड़ें", bn: "ট্যালেন্টব্যান্ড জোড়া দিন" },
  start: { en: "Start", hi: "शुरू करें", bn: "শুরু" },
  upload: { en: "Upload", hi: "अप��ोड", bn: "আপলোড" },
  record: { en: "Record", hi: "रिकॉर्ड", bn: "রেকর্ড" },
  results: { en: "Results", hi: "परिणाम", bn: "ফলাফল" },
  analysis: { en: "Performance Analysis", hi: "प्रदर्शन विश्लेषण", bn: "পারফরম্যান্স বিশ্লেষণ" },
};

const I18nContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof dictionary) => string;
}>({ lang: "en", setLang: () => {}, t: () => "" });

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("tt360_lang") as Language | null;
      return (saved as Language) || "en";
    } catch {
      return "en";
    }
  });

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem("tt360_lang", l);
    } catch {}
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => (key: keyof typeof dictionary) => dictionary[key][lang] || dictionary[key].en, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
