"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, MapPin, FolderOpen, FileText, 
  ChevronRight, Bell, Moon, Globe, Trash2, 
  ExternalLink, Fingerprint, Info, Check,
  Zap, Database, Cpu, Lock, Eye, UserCheck, ScrollText
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/app/context/LanguageContext";

const LANGUAGES = [
  { id: "EN", name: "English", sub: "United States", flag: "🇺🇸" },
  { id: "HI", name: "हिन्दी", sub: "India", flag: "🇮🇳" },
  { id: "JA", name: "日本語", sub: "Japan", flag: "🇯🇵" },
  { id: "FR", name: "Français", sub: "France", flag: "🇫🇷" },
  { id: "ES", name: "Español", sub: "Spain", flag: "🇪🇸" },
];

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const [locationAccess, setLocationAccess] = useState(true);
  const [fileAccess, setFileAccess] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationPush, setNotificationPush] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState(false);

  const handleLanguageSwitch = (id: any) => {
    setLang(id);
    toast.success("PROTOCOL_SYNC", {
      description: `Interface updated to ${id} sequence.`,
    });
  };

  const togglePermission = (type: string, current: boolean, setter: Function) => {
    const action = !current ? "GRANTED" : "REVOKED";
    setter(!current);
    toast.info(`PROTOCOL_${type}`, {
      description: `Access permission ${action} by user.`
    });
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white p-6 md:p-12 pb-32 selection:bg-[#D4FF33] selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER - Sidebar Style Matching */}
        <header className="mb-16">
          <motion.h1 
            key={lang}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter mb-4"
          >
            {t('settings.title')}
          </motion.h1>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-[#D4FF33] text-black text-[9px] font-black uppercase tracking-widest rounded-full">
               Node Active
             </div>
             <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
               <Fingerprint size={12} className="text-zinc-500" /> 
               {lang}::PROTOCOL_REVISION_2026
             </p>
          </div>
        </header>

        <div className="space-y-20">
          
          {/* SECTION: LANGUAGE SELECTOR */}
          <section>
            <div className="flex items-center gap-3 mb-8 ml-2">
              <Globe size={14} className="text-[#D4FF33]" />
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                {t('settings.lang_protocol')}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLanguageSwitch(l.id)}
                  className={`group relative p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                    lang === l.id 
                    ? "bg-[#D4FF33] border-[#D4FF33] text-black shadow-[0_20px_40px_-15px_rgba(212,255,51,0.25)]" 
                    : "bg-white/[0.02] border-white/[0.05] text-zinc-500 hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <span className={`text-3xl transition-transform duration-500 group-hover:scale-110 ${lang !== l.id && 'grayscale opacity-50'}`}>
                      {l.flag}
                    </span>
                    <div className="text-center">
                      <p className="text-[11px] font-black uppercase tracking-tight">
                        {l.name}
                      </p>
                      <p className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 opacity-60`}>
                        {l.sub}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION: HARDWARE PERMISSIONS */}
          <section>
            <div className="flex items-center gap-3 mb-8 ml-2">
              <Cpu size={14} className="text-[#D4FF33]" />
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                {t('settings.hardware')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PermissionTile 
                icon={MapPin} 
                title={t('settings.location')} 
                desc="Nearby transmission discovery"
                active={locationAccess}
                onToggle={() => togglePermission("LOCATION", locationAccess, setLocationAccess)}
              />
              <PermissionTile 
                icon={FolderOpen} 
                title={t('settings.files')} 
                desc="Local media node access"
                active={fileAccess}
                onToggle={() => togglePermission("STORAGE", fileAccess, setFileAccess)}
              />
            </div>
          </section>

          {/* SECTION: PRIVACY CONTROLS */}
          <section>
            <div className="flex items-center gap-3 mb-8 ml-2">
              <Lock size={14} className="text-[#D4FF33]" />
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                Privacy & Visibility
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PermissionTile
                icon={Eye}
                title="Public Profile"
                desc="Allow others to view your profile"
                active={profileVisibility}
                onToggle={() => togglePermission("PROFILE_VISIBILITY", profileVisibility, setProfileVisibility)}
              />
              <PermissionTile
                icon={UserCheck}
                title="Show Activity"
                desc="Display likes, follows and comments"
                active={activityVisibility}
                onToggle={() => togglePermission("ACTIVITY_VISIBILITY", activityVisibility, setActivityVisibility)}
              />
            </div>
          </section>

          {/* SECTION: NOTIFICATION PREFERENCES */}
          <section>
            <div className="flex items-center gap-3 mb-8 ml-2">
              <Bell size={14} className="text-[#D4FF33]" />
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                Notification Preferences
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PermissionTile
                icon={Bell}
                title="Push Alerts"
                desc="Receive in-app notification alerts"
                active={notificationPush}
                onToggle={() => togglePermission("PUSH_ALERTS", notificationPush, setNotificationPush)}
              />
              <PermissionTile
                icon={FileText}
                title="Email Alerts"
                desc="Receive weekly activity summaries"
                active={notificationEmail}
                onToggle={() => togglePermission("EMAIL_ALERTS", notificationEmail, setNotificationEmail)}
              />
            </div>
          </section>

          {/* SECTION: LEGAL & COMPLIANCE */}
          <section>
            <div className="flex items-center gap-3 mb-8 ml-2">
              <ScrollText size={14} className="text-[#D4FF33]" />
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                Legal & Compliance
              </h2>
            </div>

            <div className="space-y-4">
              <LegalTile
                icon={Shield}
                title="Privacy Policy"
                desc="How your data is collected, used and protected"
              />
              <LegalTile
                icon={FileText}
                title="Terms & Conditions"
                desc="Rules for using PeerPicks services and content"
              />
              <LegalTile
                icon={Lock}
                title="Permissions & Data Access"
                desc="Controls for camera, storage, location and notifications"
              />
            </div>
          </section>

          {/* DELETE PROTOCOL [2026-02-01] */}
          <section className="pt-12">
            <button className="w-full p-2 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] overflow-hidden group transition-all hover:border-red-500/40">
              <div className="flex items-center justify-between p-6 bg-[#020203] rounded-[2.2rem]">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 group-hover:rotate-12 transition-transform">
                    <Trash2 size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black uppercase italic text-red-500 tracking-tighter">
                      {t('settings.delete')}
                    </p>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-mono mt-1">
                      Immediate Node Termination • IRREVERSIBLE
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[8px] font-black text-red-500/30 uppercase tracking-[0.3em] hidden md:block">Critical Action</span>
                   <ChevronRight size={20} className="text-red-500/20 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}

function PermissionTile({ icon: Icon, title, desc, active, onToggle }: any) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2.2rem] flex items-center justify-between group transition-all hover:bg-white/[0.04]">
      <div className="flex gap-5 items-center">
        <div className={`p-4 rounded-2xl transition-all duration-500 ${active ? 'bg-[#D4FF33] text-black shadow-[0_0_20px_rgba(212,255,51,0.2)]' : 'bg-white/5 text-zinc-600'}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black uppercase italic tracking-tight">{title}</p>
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{desc}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-all duration-500 ${active ? 'bg-[#D4FF33]/20' : 'bg-zinc-900 border border-white/5'}`}
      >
        <motion.div 
          animate={{ x: active ? 28 : 4 }}
          className={`absolute top-1 w-4 h-4 rounded-full transition-colors duration-500 ${active ? 'bg-[#D4FF33]' : 'bg-zinc-700'}`}
        />
      </button>
    </div>
  );
}

function LegalTile({ icon: Icon, title, desc }: any) {
  return (
    <button
      type="button"
      className="w-full p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] flex items-center justify-between text-left hover:bg-white/[0.04] hover:border-white/10 transition-all"
      title={title}
      aria-label={title}
    >
      <div className="flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-white/5 text-zinc-400">
          <Icon size={20} strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-tight text-white">{title}</p>
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider mt-1">{desc}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-zinc-500" />
    </button>
  );
}