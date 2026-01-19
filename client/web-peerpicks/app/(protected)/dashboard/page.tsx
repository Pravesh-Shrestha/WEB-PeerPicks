"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, Search, TrendingUp, Map, Bell, 
  User, Plus, LogOut, Sun, Moon, 
  MessageSquare, Heart, MapPin, Star, Sparkles, ShieldCheck, CheckCircle2
} from 'lucide-react';

// Server Action for Logout
import { handleLogout } from '../../../lib/actions/auth-action'; 

import logoLight from '../../../public/logo2.png'; 
import logoDark from '../../../public/logo1.png';  

export default function PeerPicksDashboard() {
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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('peerpicks-theme', newTheme);
  };

  if (!mounted) return null;

  return (
    <div className={`flex h-screen transition-colors duration-300 selection:bg-[#D4FF33] selection:text-black ${
      theme === 'dark' ? 'bg-[#0B0C10] text-white' : 'bg-slate-50 text-slate-900'
    }`} style={{ fontFamily: "'Roboto', sans-serif" }}>
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className={`w-64 border-r p-6 flex flex-col ${
        theme === 'dark' ? 'border-white/5 bg-[#0F1116]' : 'border-slate-200 bg-white'
      }`}>
        <div className="mb-10 px-2">
          <Image src={theme === 'dark' ? logoLight : logoDark} alt="PeerPicks" width={110} height={35} className="object-contain" />
        </div>

        <nav className="space-y-2 flex-1">
          <NavBtn icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} theme={theme} />
          <NavBtn icon={Search} label="Discover" active={activeTab === 'search'} onClick={() => setActiveTab('search')} theme={theme} />
          <NavBtn icon={TrendingUp} label="Trending" active={activeTab === 'trending'} onClick={() => setActiveTab('trending')} theme={theme} />
          <NavBtn icon={Map} label="Maps" active={activeTab === 'maps'} onClick={() => setActiveTab('maps')} theme={theme} />
          <NavBtn icon={Bell} label="Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} theme={theme} />
        </nav>

        <div className={`pt-6 border-t space-y-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white transition-all text-[11px] font-medium uppercase tracking-wider">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
          
          <button className="w-full py-3.5 bg-[#D4FF33] hover:bg-[#c6f01a] active:scale-[0.98] transition-all rounded-2xl text-black font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-lime-500/20">
            <Plus size={18} /> Create Review
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-[#0B0C10]' : 'bg-slate-50'}`}>
        <div className="max-w-2xl mx-auto py-8 px-6">
          
          {/* Feed Navigation */}
          <div className="flex gap-8 mb-8 border-b border-white/5">
            {['for-you', 'following'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setFeedSection(tab as any)}
                className={`pb-3 text-[12px] font-bold uppercase tracking-widest transition-all relative ${
                  feedSection === tab ? (theme === 'dark' ? 'text-[#D4FF33]' : 'text-[#5D44F8]') : 'text-gray-500'
                }`}
              >
                {tab.replace('-', ' ')}
                {feedSection === tab && (
                  <motion.div layoutId="tab-line" className={`absolute bottom-0 left-0 w-full h-0.5 ${theme === 'dark' ? 'bg-[#D4FF33]' : 'bg-[#5D44F8]'}`} />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={feedSection + activeTab} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
            >
              {/* EXPANDED WELCOME CARD */}
              {feedSection === 'for-you' && activeTab === 'home' && (
                <div className="mb-10 p-10 rounded-[3rem] bg-gradient-to-br from-[#5D44F8] to-[#0F1116] border border-white/10 relative overflow-hidden shadow-2xl">
                  {/* Glowing Green Decorative Blur */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4FF33]/10 blur-[80px] rounded-full" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="p-3 bg-[#D4FF33] rounded-2xl text-black shadow-lg shadow-lime-500/20">
                        <Sparkles size={28} />
                      </div>
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                        Welcome to the <span className="text-[#D4FF33]">Family!</span>
                      </h2>
                    </div>
                    
                    <p className="text-[15px] text-gray-300 leading-relaxed mb-8 max-w-lg">
                      Thank you for joining <span className="text-white font-bold">PeerPicks</span>. We&apos;re building a world of verified peer-to-peer consensus, and your voice matters. Explore local discoveries or share your own!
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <CheckCircle2 size={16} className="text-[#D4FF33]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Verified Member</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <ShieldCheck size={16} className="text-[#D4FF33]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Consensus Access</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <HomeContent theme={theme} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- RIGHT SIDEBAR --- */}
      <aside className={`w-72 p-6 hidden xl:flex flex-col ${
        theme === 'dark' ? 'bg-[#0F1116] border-l border-white/5' : 'bg-white border-l border-slate-200'
      }`}>
        <div className={`rounded-[2.5rem] p-6 mb-6 ${
          theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#5D44F8] shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-[14px] font-black uppercase italic tracking-tight">User</h3>
              <p className="text-[10px] text-[#D4FF33] font-bold uppercase tracking-[0.15em]">Active Peer</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 transition-all border border-white/10">
              Profile
            </button>
            <button 
              onClick={async () => { await handleLogout(); }}
              className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className={`rounded-[2.5rem] p-6 ${
          theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'
        }`}>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#D4FF33]" /> Network Trust
          </h4>
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Reputation</span>
              <span className="text-xl font-black italic text-[#D4FF33]">92.4</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ duration: 1.5 }} className="bg-[#D4FF33] h-full" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick, theme }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
        active 
          ? 'bg-[#5D44F8] text-white shadow-xl shadow-indigo-500/30' 
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      }`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[12px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function HomeContent({ theme }: { theme: 'light' | 'dark' }) {
  const reviews = [
    { title: "Central Bistro", author: "alex_eats", rating: 5, location: "Downtown", time: "12m ago", likes: 24, comments: 8 },
    { title: "Neon Fitness", author: "gym_rat", rating: 4, location: "North Side", time: "2h ago", likes: 84, comments: 15 },
  ];

  return (
    <div className="space-y-5">
      {reviews.map((r, i) => (
        <div key={i} className={`p-6 rounded-[2.5rem] border transition-all ${
          theme === 'dark' ? 'bg-[#0F1116] border-white/5 hover:border-[#D4FF33]/20' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex justify-between mb-4">
            <div>
              <h4 className="text-[15px] font-black uppercase italic tracking-tight">{r.title}</h4>
              <p className={`text-[10px] font-bold mt-1 uppercase ${theme === 'dark' ? 'text-[#D4FF33]' : 'text-[#5D44F8]'}`}>
                @{r.author} • {r.time}
              </p>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, star) => (
                <Star key={star} size={12} className={star < r.rating ? 'fill-[#D4FF33] text-[#D4FF33]' : 'text-gray-700'} />
              ))}
            </div>
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed mb-5">
            Outstanding quality and verified consensus from the peer community. Definitely a top recommendation for this week.
          </p>
          <div className="flex items-center gap-6 pt-4 border-t border-white/5">
            <button className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-[#D4FF33] transition-all">
              <Heart size={16} /> {r.likes}
            </button>
            <button className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-[#5D44F8] transition-all">
              <MessageSquare size={16} /> {r.comments}
            </button>
            <div className="ml-auto text-[10px] font-bold text-gray-500 flex items-center gap-1.5 italic">
              <MapPin size={12} className="text-[#D4FF33]" /> {r.location}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}