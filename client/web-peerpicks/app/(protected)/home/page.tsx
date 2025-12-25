"use client";
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Utensils, Coffee, Book, MapPin, Star, LogOut, Plus } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Auth Guard: If no mock token, send back to login
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      const isAuth = localStorage.getItem("isLoggedIn");
      if (!isAuth) {
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col bg-[var(--card-bg)]">
        <div className="text-xl font-black italic mb-10 uppercase tracking-tighter">
          PEER<span className="text-secondary">PICKS</span>
        </div>
        <nav className="space-y-4 flex-grow">
          {['Discover', 'My Reviews', 'Favorites'].map(item => (
            <button key={item} className="w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-secondary hover:text-black transition-all">
              {item}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => { localStorage.removeItem("isLoggedIn"); router.push("/"); }}
          className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-widest p-4 hover:bg-red-500/10 rounded-xl"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Feed</h1>
          <button className="bg-secondary text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Plus size={16} /> Write Review
          </button>
        </header>

        {/* SEARCH & RECENT ACTIVITY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" size={20} />
              <input 
                type="text" 
                placeholder="Search places..." 
                className="w-full bg-[var(--card-bg)] border border-white/5 rounded-2xl py-5 pl-14 pr-5 focus:outline-none focus:border-secondary transition-all"
              />
            </div>
            
            {/* MOCK LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[var(--card-bg)] p-5 rounded-3xl border border-white/5 hover:border-secondary/30 transition-all cursor-pointer">
                  <div className="h-40 bg-white/5 rounded-2xl mb-4" />
                  <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase text-sm">Place Name {i}</h3>
                    <span className="text-secondary font-black text-xs">★ 4.9</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATS/COMMUNITY SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-secondary/10 border border-secondary/20 p-6 rounded-[2rem]">
              <h3 className="font-black uppercase text-xs mb-4">Your Influence</h3>
              <div className="text-4xl font-black text-secondary tracking-tighter">842</div>
              <p className="text-[10px] uppercase font-bold opacity-50 mt-1">Impact Points</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}