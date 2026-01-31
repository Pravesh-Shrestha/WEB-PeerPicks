"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, Search, TrendingUp, Map, Bell, 
  User as UserIcon, Plus, LogOut, Sun, Moon, 
  MessageSquare, Heart, MapPin, Star, Sparkles, ShieldCheck, CheckCircle2,
  Loader2, ChevronRight, Settings, Zap, Award, Target
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { handleLogout } from '../../../lib/actions/auth-action'; 

import logoLight from '../../../public/logo2.png'; 
import logoDark from '../../../public/logo1.png';  

export default function PeerPicksDashboard() {
  const { user, loading } = useAuth(); 
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState('home');
  const [feedSection, setFeedSection] = useState<'for-you' | 'following'>('for-you');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('peerpicks-theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Strict Auth Guard
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, mounted, router]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('peerpicks-theme', newTheme);
  };

const onLogout = async () => {
  try {
    // 1. Execute server-side logout action
    await handleLogout();

    // 2. Clear client-side data
    localStorage.removeItem("peerpicks-theme");
    // Cookies are usually cleared by the handleLogout action via 'Set-Cookie' header,
    // but if you are using manual cookies:
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // 3. Wipe and redirect
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error);
    window.location.href = "/login"; // Force redirect anyway
  }
};

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Peer';

  if (!mounted || loading) {
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center gap-4 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10]' : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 50%, rgba(93, 68, 248, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(212, 255, 51, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(93, 68, 248, 0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="text-[#D4FF33]" size={36} />
        </motion.div>
        <motion.p 
          className="text-[10px] font-black uppercase tracking-[0.2em]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Establishing Consensus
        </motion.p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col lg:flex-row h-screen transition-colors duration-300 relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10] text-white"
          : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900"
      }`}
    >
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-[#5D44F8]/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, 30, 0],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-[#D4FF33]/10 rounded-full blur-[100px]"
          animate={{
            scale: [1.15, 1, 1.15],
            x: [0, -20, 0],
            y: [0, -30, 0],
            opacity: [0.4, 0.3, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* --- LEFT SIDEBAR --- */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full lg:w-64 xl:w-72 border-b lg:border-b-0 lg:border-r p-4 sm:p-6 flex flex-col transition-all duration-300 backdrop-blur-xl relative z-10 ${
          theme === "dark"
            ? "border-white/10 bg-[#0F1116]/80"
            : "border-slate-200 bg-white/80"
        }`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
          className="mb-6 px-2"
        >
          <Image
            src={theme === "dark" ? logoLight : logoDark}
            alt="PeerPicks"
            width={100}
            height={32}
            className="object-contain"
          />
        </motion.div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto">
          <NavBtn
            icon={Home}
            label="Home"
            active={activeTab === "home"}
            onClick={() => setActiveTab("home")}
            theme={theme}
            delay={0.15}
          />
          <NavBtn
            icon={Search}
            label="Discover"
            active={activeTab === "search"}
            onClick={() => setActiveTab("search")}
            theme={theme}
            delay={0.18}
          />
          <NavBtn
            icon={TrendingUp}
            label="Trending"
            active={activeTab === "trending"}
            onClick={() => setActiveTab("trending")}
            theme={theme}
            delay={0.21}
          />
          <NavBtn
            icon={Map}
            label="Maps"
            active={activeTab === "maps"}
            onClick={() => setActiveTab("maps")}
            theme={theme}
            delay={0.24}
          />
          <NavBtn
            icon={Bell}
            label="Alerts"
            active={activeTab === "alerts"}
            onClick={() => setActiveTab("alerts")}
            theme={theme}
            delay={0.27}
          />
        </nav>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
          className={`pt-4 border-t space-y-2.5 mt-4 ${theme === "dark" ? "border-white/10" : "border-slate-200"}`}
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
              theme === "dark"
                ? "bg-white/5 border border-white/10 hover:border-[#D4FF33]/30"
                : "bg-slate-100 border border-slate-200 hover:border-[#5D44F8]/30"
            }`}
          >
            <div
              className={`flex items-center gap-3 transition-colors duration-200 ${
                theme === "dark"
                  ? "text-gray-400 group-hover:text-white"
                  : "text-slate-600 group-hover:text-slate-900"
              }`}
            >
              <motion.div
                animate={{ rotate: theme === "dark" ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </motion.div>
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </div>
            <div
              className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${theme === "dark" ? "bg-[#D4FF33]" : "bg-slate-300"}`}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-black shadow-lg"
                animate={{ x: theme === "dark" ? 18 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="group relative w-full py-3.5 bg-gradient-to-r from-[#D4FF33] to-[#b8d928] hover:from-[#b8d928] hover:to-[#D4FF33] rounded-xl text-black font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-[0_8px_24px_-8px_rgba(212,255,51,0.5)] overflow-hidden transition-all duration-200"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <Plus size={16} strokeWidth={3} />
            <span>Create Review</span>
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
          {/* Tab Navigation */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
            className={`flex gap-6 sm:gap-8 mb-6 sm:mb-8 border-b ${theme === "dark" ? "border-white/10" : "border-slate-200"}`}
          >
            {["for-you", "following"].map((tab, index) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + index * 0.05,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                onClick={() => setFeedSection(tab as any)}
                className={`pb-3 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-200 relative ${
                  feedSection === tab
                    ? theme === "dark"
                      ? "text-[#D4FF33]"
                      : "text-[#5D44F8]"
                    : "text-gray-500"
                }`}
              >
                {tab.replace("-", " ")}
                {feedSection === tab && (
                  <motion.div
                    layoutId="tab-line"
                    className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${theme === "dark" ? "bg-[#D4FF33]" : "bg-[#5D44F8]"}`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={feedSection + activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* WELCOME CARD */}
              {feedSection === "for-you" && activeTab === "home" && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
                  className="mb-8 sm:mb-10 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#5D44F8] via-[#4a35c9] to-[#2A1E8A] border border-white/20 relative overflow-hidden shadow-2xl"
                >
                  {/* Animated background elements */}
                  <motion.div
                    className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#D4FF33]/10 blur-[80px] sm:blur-[100px] rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 blur-[60px] sm:blur-[80px] rounded-full"
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.35,
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="p-2.5 sm:p-3 bg-[#D4FF33] rounded-xl sm:rounded-2xl text-black shadow-xl"
                      >
                        <Sparkles size={20} className="sm:w-7 sm:h-7" />
                      </motion.div>
                      <motion.h2
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          delay: 0.4,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white leading-none"
                      >
                        Welcome,{" "}
                        <span className="text-[#D4FF33]">{firstName}</span>
                      </motion.h2>
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: 0.45,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="text-[13px] sm:text-[14px] text-white/70 leading-relaxed mb-6 sm:mb-8 max-w-lg font-medium"
                    >
                      Your voice strengthens the{" "}
                      <span className="text-white font-bold">PeerPicks</span>{" "}
                      network. Ready to discover what&apos;s trending in your
                      circle?
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.5,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="flex flex-wrap items-center gap-2 sm:gap-3"
                    >
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20">
                        <CheckCircle2
                          size={12}
                          className="sm:w-3.5 sm:h-3.5 text-[#D4FF33]"
                        />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/90">
                          Verified Peer
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20">
                        <Zap
                          size={12}
                          className="sm:w-3.5 sm:h-3.5 text-[#D4FF33]"
                        />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/90">
                          Active Status
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              <HomeContent theme={theme} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- RIGHT SIDEBAR --- */}
      <motion.aside
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full lg:w-72 xl:w-80 p-4 sm:p-6 hidden lg:flex flex-col gap-4 backdrop-blur-xl relative z-10 ${
          theme === "dark"
            ? "bg-[#0F1116]/80 border-l border-white/10"
            : "bg-white/80 border-l border-slate-200"
        }`}
      >
        {/* User Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden group ${
            theme === "dark"
              ? "bg-gradient-to-br from-white/5 to-white/10 border border-white/10 shadow-xl"
              : "bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-lg"
          }`}
        >
          <div className="relative flex flex-col items-center text-center gap-3 mb-5">
            <motion.div
              whileHover={{ scale: 1.03, rotate: 3 }}
              className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5D44F8] to-[#4a35c9] flex items-center justify-center text-white shadow-2xl cursor-pointer overflow-hidden border-2 border-[#D4FF33]/20"
            >
              {/* Because of your 'rewrites', we just use the relative path.
          Next.js proxies /uploads/... to http://localhost:3000/uploads/...
      */}
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture} // e.g., "/uploads/image.jpg"
                  alt={user.fullName || "Profile"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <UserIcon size={28} strokeWidth={1.5} />
              )}

              <motion.div className="absolute inset-0 rounded-2xl bg-[#D4FF33]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[2px]">
                <Plus size={18} className="text-[#D4FF33]" />
              </motion.div>
            </motion.div>

            <div>
              <h3 className="text-[13px] sm:text-[14px] font-black uppercase italic tracking-tight truncate max-w-[200px]">
                {user?.fullName || "Peer User"}
              </h3>
              <p className="text-[8px] text-[#D4FF33] font-black uppercase tracking-[0.3em] mt-1 flex items-center justify-center gap-1">
                <Award size={9} />
                Network Member
              </p>
            </div>
          </div>

          <div className="space-y-2 relative">
            <Link
              href="/user/profile"
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-200 group/link ${
                theme === "dark"
                  ? "bg-white/5 hover:bg-white/10 text-white hover:border-[#D4FF33]/30 border border-white/10"
                  : "bg-white hover:bg-slate-50 text-slate-900 shadow-sm border border-slate-200 hover:border-[#5D44F8]/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings
                  size={13}
                  className="text-gray-400 group-hover/link:text-[#D4FF33] transition-colors duration-200"
                />
                Profile Settings
              </div>
              <ChevronRight
                size={13}
                className="group-hover/link:translate-x-1 transition-transform duration-200"
              />
            </Link>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onLogout}
              className="flex items-center justify-center gap-2.5 w-full py-2.5 bg-red-500/10 text-red-500 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-200"
            >
              <LogOut size={13} /> Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Network Trust Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
          className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden ${
            theme === "dark"
              ? "bg-gradient-to-br from-white/5 to-white/10 border border-white/10"
              : "bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-lg"
          }`}
        >
          <motion.div
            className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4FF33]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          <h4 className="relative text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5 flex items-center gap-2">
            <ShieldCheck size={13} className="text-[#D4FF33]" /> Network Trust
          </h4>
          <div className="relative space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-black">
                Reputation
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="text-xl sm:text-2xl font-black italic text-[#D4FF33]"
              >
                92.4
              </motion.span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "92%" }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-[#5D44F8] via-[#7B5CF8] to-[#D4FF33] h-full relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1.5,
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
          className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 ${
            theme === "dark"
              ? "bg-gradient-to-br from-white/5 to-white/10 border border-white/10"
              : "bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-lg"
          }`}
        >
          <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
            <Target size={13} className="text-[#5D44F8]" /> Quick Stats
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Reviews" value="24" theme={theme} delay={0.35} />
            <StatCard
              label="Followers"
              value="382"
              theme={theme}
              delay={0.38}
            />
            <StatCard
              label="Following"
              value="156"
              theme={theme}
              delay={0.41}
            />
            <StatCard label="Likes" value="1.2k" theme={theme} delay={0.44} />
          </div>
        </motion.div>
      </motion.aside>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick, theme, delay }: any) {
  return (
    <motion.button 
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      onClick={onClick} 
      whileHover={{ scale: 1.01, x: 3 }}
      whileTap={{ scale: 0.99 }}
      className={`group w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-gradient-to-r from-[#5D44F8] to-[#4a35c9] text-white shadow-[0_8px_24px_-8px_rgba(93,68,248,0.6)]' 
          : theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Icon size={17} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em]">{label}</span>
      {active && (
        <motion.div
          className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4FF33]"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}

function StatCard({ label, value, theme, delay }: any) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`p-3 rounded-xl text-center transition-all duration-200 ${
        theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'
      }`}
    >
      <p className="text-[8px] text-gray-500 uppercase font-black tracking-wider mb-1">{label}</p>
      <p className="text-lg sm:text-xl font-black italic text-[#D4FF33]">{value}</p>
    </motion.div>
  );
}

function HomeContent({ theme }: { theme: 'light' | 'dark' }) {
  const reviews = [
    { title: "Central Bistro", author: "alex_eats", rating: 5, location: "Downtown", time: "12m ago", likes: 24, comments: 8 },
    { title: "Neon Fitness", author: "gym_rat", rating: 4, location: "North Side", time: "2h ago", likes: 84, comments: 15 },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {reviews.map((r, i) => (
        <motion.div 
          key={i} 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease: "easeOut" }}
          whileHover={{ y: -3, scale: 1.005 }}
          className={`p-5 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
            theme === 'dark' ? 'bg-gradient-to-br from-[#0F1116] to-[#1a1d29] border-white/10 hover:border-[#D4FF33]/30' : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'
          }`}
        >
          {/* Hover glow effect */}
          <motion.div 
            className="absolute top-0 right-0 w-24 h-24 bg-[#D4FF33]/0 group-hover:bg-[#D4FF33]/10 rounded-full blur-3xl transition-all duration-300"
          />
          
          <div className="relative flex justify-between items-start mb-4 sm:mb-5">
            <div>
              <h4 className="text-[15px] sm:text-[17px] font-black uppercase italic tracking-tight">{r.title}</h4>
              <p className={`text-[9px] sm:text-[10px] font-black mt-1.5 uppercase tracking-widest ${theme === 'dark' ? 'text-[#D4FF33]' : 'text-[#5D44F8]'}`}>
                @{r.author} • {r.time}
              </p>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, star) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + star * 0.03, type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Star size={12} className={star < r.rating ? 'fill-[#D4FF33] text-[#D4FF33]' : 'text-gray-700'} />
                </motion.div>
              ))}
            </div>
          </div>
          
          <p className="relative text-[12px] sm:text-[13px] text-gray-400 leading-relaxed mb-5 sm:mb-6">
            Verified consensus from the peer community. Excellent quality and service highly recommended by the network.
          </p>
          
          <div className={`relative flex items-center gap-4 sm:gap-6 pt-4 sm:pt-5 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              <Heart size={15} /> {r.likes}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black text-gray-500 hover:text-[#5D44F8] transition-colors duration-200"
            >
              <MessageSquare size={15} /> {r.comments}
            </motion.button>
            <div className="ml-auto text-[8px] sm:text-[9px] font-black text-gray-500 flex items-center gap-1.5 italic uppercase tracking-widest">
              <MapPin size={11} className="text-[#D4FF33]" /> {r.location}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}