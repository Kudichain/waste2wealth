import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.impact": "Impact",
    "nav.getStarted": "Get Started",
    "nav.login": "Login",
    
    // Hero Section
    "hero.title": "Turn Waste Into Wealth",
    "hero.subtitle": "Join thousands of collectors earning sustainable income while protecting our environment",
    "hero.cta": "Start Earning Today",
    "hero.learnMore": "Learn More",
    
    // Dashboard
    "dashboard.welcome": "Welcome back",
    "dashboard.totalEarnings": "Total Earnings",
    "dashboard.todayEarnings": "Today's Earnings",
    "dashboard.wasteCollected": "Waste Collected",
    "dashboard.level": "Level",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
  },
  ha: {
    // Navigation
    "nav.home": "Gida",
    "nav.about": "Game Da Mu",
    "nav.impact": "Tasiri",
    "nav.getStarted": "Fara",
    "nav.login": "Shiga",
    
    // Hero Section
    "hero.title": "Mayar Da Shara Dukiya",
    "hero.subtitle": "Haɗu da dubban masu tattarawa waɗanda ke samun kuɗin shiga mai dorewa yayin kare muhallinmu",
    "hero.cta": "Fara Samun Kuɗi Yau",
    "hero.learnMore": "Ƙarin Koyo",
    
    // Dashboard
    "dashboard.welcome": "Barka da dawowa",
    "dashboard.totalEarnings": "Jimlar Abin Da Aka Samu",
    "dashboard.todayEarnings": "Abin Da Aka Samu Yau",
    "dashboard.wasteCollected": "Sharar Da Aka Tattara",
    "dashboard.level": "Matsayi",
    
    // Common
    "common.loading": "Ana Lodi...",
    "common.save": "Ajiye",
    "common.cancel": "Soke",
    "common.submit": "Tura",
    "common.delete": "Share",
    "common.edit": "Gyara",
    "common.view": "Duba",
  },
  yo: {
    // Navigation
    "nav.home": "Ile",
    "nav.about": "Nipa Wa",
    "nav.impact": "Ipa",
    "nav.getStarted": "Bẹrẹ",
    "nav.login": "Wọle",
    
    // Hero Section
    "hero.title": "Yi Idoti Di Ọrọ",
    "hero.subtitle": "Darapọ mọ ẹgbẹẹgbẹrun awọn olugba ti n ṣiṣẹ ni owo-wiwọle alagbero lakoko titọju ayika wa",
    "hero.cta": "Bẹrẹ Iṣowo Loni",
    "hero.learnMore": "Kọ Diẹ Sii",
    
    // Dashboard
    "dashboard.welcome": "Kaabo pada",
    "dashboard.totalEarnings": "Apapọ Ere",
    "dashboard.todayEarnings": "Ere Oni",
    "dashboard.wasteCollected": "Idoti Ti A Gba",
    "dashboard.level": "Ipele",
    
    // Common
    "common.loading": "N ṣiṣẹ...",
    "common.save": "Fipamọ",
    "common.cancel": "Fagilee",
    "common.submit": "Firanṣẹ",
    "common.delete": "Paarẹ",
    "common.edit": "Ṣatunkọ",
    "common.view": "Wo",
  },
  ig: {
    // Navigation
    "nav.home": "Ụlọ",
    "nav.about": "Banyere Anyị",
    "nav.impact": "Mmetụta",
    "nav.getStarted": "Bido",
    "nav.login": "Banye",
    
    // Hero Section
    "hero.title": "Mee Ka Ahịhịa Bụrụ Akụ",
    "hero.subtitle": "Sonye ọtụtụ puku ndị na-anakọta ego na-enweta ego na-adịgide adịgide mgbe ha na-echebe gburugburu anyị",
    "hero.cta": "Bido Inweta Ego Taa",
    "hero.learnMore": "Mụtakwuo",
    
    // Dashboard
    "dashboard.welcome": "Nnọọ ọzọ",
    "dashboard.totalEarnings": "Ngụkọta Ego",
    "dashboard.todayEarnings": "Ego Taa",
    "dashboard.wasteCollected": "Ahịhịa Anakọtara",
    "dashboard.level": "Ọkwa",
    
    // Common
    "common.loading": "Na-ebu...",
    "common.save": "Chekwa",
    "common.cancel": "Kagbuo",
    "common.submit": "Ziga",
    "common.delete": "Hichapụ",
    "common.edit": "Dezie",
    "common.view": "Lee",
  },
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.about": "À Propos",
    "nav.impact": "Impact",
    "nav.getStarted": "Commencer",
    "nav.login": "Connexion",
    
    // Hero Section
    "hero.title": "Transformez les Déchets en Richesse",
    "hero.subtitle": "Rejoignez des milliers de collecteurs gagnant un revenu durable tout en protégeant notre environnement",
    "hero.cta": "Commencez à Gagner Aujourd'hui",
    "hero.learnMore": "En Savoir Plus",
    
    // Dashboard
    "dashboard.welcome": "Bon retour",
    "dashboard.totalEarnings": "Gains Totaux",
    "dashboard.todayEarnings": "Gains d'Aujourd'hui",
    "dashboard.wasteCollected": "Déchets Collectés",
    "dashboard.level": "Niveau",
    
    // Common
    "common.loading": "Chargement...",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.submit": "Soumettre",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.view": "Voir",
  },
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or browser language or default to English
    const saved = localStorage.getItem("language");
    if (saved && translations[saved]) return saved;
    
    const browserLang = navigator.language.split("-")[0];
    if (translations[browserLang]) return browserLang;
    
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

// Language list for UI
export const availableLanguages = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ha", label: "Hausa", flag: "🇳🇬" },
  { value: "yo", label: "Yoruba", flag: "🇳🇬" },
  { value: "ig", label: "Igbo", flag: "🇳🇬" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
];
