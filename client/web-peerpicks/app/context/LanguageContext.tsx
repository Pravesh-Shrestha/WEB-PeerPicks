"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const DICTIONARY: any = {
  EN: {
    nav: { home: "Home", discover: "Discover", notifications: "Notifications", favorites: "Favorites", settings: "Settings" },
    common: { status: "Protocol Secured" },
    settings: { title: "System Config", hardware: "Hardware Access", location: "Location Services", files: "File System", delete: "Delete Account" }
  },
  HI: {
    nav: { home: "होम", discover: "खोजें", notifications: "सूचनाएं", favorites: "पसंदीदा", settings: "सेटिंग्स" },
    common: { status: "प्रोटोकॉल सुरक्षित" },
    settings: { title: "सिस्टम कॉन्फ़िगर", hardware: "हार्डवेयर एक्सेस", location: "स्थान सेवाएं", files: "फ़ाइल सिस्टम", delete: "खाता हटाएं" }
  },
  JA: {
    nav: { home: "ホーム", discover: "発見", notifications: "通知", favorites: "お気に入り", settings: "設定" },
    common: { status: "プロトコル保護済み" },
    settings: { title: "システム構成", hardware: "ハードウェアアクセス", location: "位置情報サービス", files: "ファイルシステム", delete: "アカウントを削除" }
  },
  FR: {
    nav: { home: "Accueil", discover: "Découvrir", notifications: "Notifications", favorites: "Favoris", settings: "Paramètres" },
    common: { status: "Protocole Sécurisé" },
    settings: { title: "Config Système", hardware: "Matériel", location: "Localisation", files: "Fichiers", delete: "Supprimer le compte" }
  },
  ES: {
    nav: { home: "Inicio", discover: "Descubrir", notifications: "Notificaciones", favorites: "Favoritos", settings: "Ajustes" },
    common: { status: "Protocolo Seguro" },
    settings: { title: "Configuración", hardware: "Hardware", location: "Ubicación", files: "Archivos", delete: "Eliminar cuenta" }
  }
};

export type SupportedLangs = "EN" | "HI" | "JA" | "FR" | "ES";

interface LanguageContextType {
  lang: SupportedLangs;
  setLang: (l: SupportedLangs) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SupportedLangs>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("node_lang") as SupportedLangs;
    if (savedLang && DICTIONARY[savedLang]) setLangState(savedLang);
  }, []);

  const setLang = (l: SupportedLangs) => {
    setLangState(l);
    localStorage.setItem("node_lang", l);
  };

  const t = (path: string) => {
    const keys = path.split(".");
    let result = DICTIONARY[lang];
    keys.forEach((key) => { result = result?.[key]; });
    return result || path; // Returns the path if translation is missing
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};