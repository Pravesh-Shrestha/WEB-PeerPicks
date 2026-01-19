"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from 'next-themes';
import { 
  Home, Search, TrendingUp, Map, Bell, Bookmark, 
  User, Plus, ThumbsUp, MessageSquare, 
  Star, LogOut, Sun, Moon 
} from 'lucide-react';

// Import both logos
import logoLight from '../../../public/logo1.png'; // For dark background
import logoDark from '../../../public/logo2.png';  // For light background

// --- Types ---
interface DecodedToken {
  name: string;
  email: string;
  id: string;
}

interface Review {
  id: string;
  author: { name: string; location: string; avatar: string; trustScore: number };
  title: string;
  rating: number;
  content: string;
  image: string;
  upvotes: number;
  location: { name: string; coordinates: string };
}

// --- Navigation Item Component ---
const NavItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.95 }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-[#D4FF33] text-black font-black italic' 
        : 'text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="text-xs uppercase font-bold tracking-widest">{label}</span>
    {badge && (
      <span className="ml-auto bg-black dark:bg-[#D4FF33] text-[#D4FF33] dark:text-black text-[10px] font-black px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </motion.button>
);

export default function PeerPicksDashboard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserName(decoded.name || "User");
      } catch (e) { console.error(e); }
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/reviews');
        const data = await response.json();
        setReviews(data);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchDashboardData();
  }, []);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden transition-colors duration-500 font-sans selection:bg-[#D4FF33] selection:text-black">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-slate-200 dark:border-white/10 p-6 flex flex-col bg-white dark:bg-black transition-colors duration-500">
        <div className="mb-10 px-2 flex items-center justify-between">
          <Image 
            src={theme === 'dark' ? logoLight : logoDark} 
            alt="PeerPicks" 
            width={120} 
            height={40} 
            className="object-contain"
          />
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={Search} label="Discover" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
          <NavItem icon={TrendingUp} label="Trending" active={activeTab === 'trending'} onClick={() => setActiveTab('trending')} />
          <NavItem icon={Map} label="Maps" active={activeTab === 'maps'} onClick={() => setActiveTab('maps')} />
          <NavItem icon={Bell} label="Alerts" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge="3" />
        </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
          {/* Mode Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-xs uppercase font-bold tracking-widest">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-[#D4FF33] rounded-2xl text-black font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20"
          >
            <Plus size={18} /> Create Review
          </motion.button>
          
          <button onClick={handleLogout} className="w-full py-3 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN FEED --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#050505] transition-colors duration-500">
        <div className="max-w-3xl mx-auto p-10">
          <header className="mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tighter uppercase italic leading-none"
            >
              For <span className="text-[#D4FF33] drop-shadow-sm">{userName.split(' ')[0]}</span>
            </motion.h1>
            <p className="text-slate-500 dark:text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">
              Community Verified Consensus
            </p>
          </header>

          <div className="grid gap-8">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2].map(i => <div key={i} className="h-80 bg-slate-200 dark:bg-white/5 rounded-[2rem] animate-pulse" />)}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 dark:text-gray-500 uppercase font-black text-xs tracking-widest italic border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
                Start by following your favorite reviewers
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- USER STATS PANEL --- */}
      <aside className="w-80 border-l border-slate-200 dark:border-white/10 p-8 hidden xl:block bg-white dark:bg-black transition-colors duration-500">
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 mb-8 text-center group">
            <div className="w-20 h-20 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-inner">👤</div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">{userName}</h3>
            <p className="text-slate-400 dark:text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-4">Master Critic</p>
            <div className="h-px bg-slate-200 dark:bg-white/10 w-full mb-4" />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[#D4FF33] text-2xl font-black drop-shadow-sm">92</p>
                    <p className="text-[8px] text-slate-400 dark:text-gray-500 font-bold uppercase">Trust Score</p>
                </div>
                <div>
                    <p className="text-slate-900 dark:text-white text-2xl font-black">12</p>
                    <p className="text-[8px] text-slate-400 dark:text-gray-500 font-bold uppercase">Rank</p>
                </div>
            </div>
        </div>
      </aside>
    </div>
  );
}