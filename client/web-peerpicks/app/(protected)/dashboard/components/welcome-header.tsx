"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WelcomeHeader({ name }: { name: string }) {
  return (
    <div className="mb-12 p-10 rounded-[40px] bg-[#0C0C0E] border border-white/10 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
      
      {/* Ambient glow in the corner to maintain the "PeerPicks" aesthetic */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#D4FF33] blur-[100px] opacity-10" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[#D4FF33] rounded-2xl text-black shadow-[0_0_25px_rgba(212,255,51,0.3)]">
            <Sparkles size={24} />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            Welcome, <span className="text-[#D4FF33]">{name || "User"}</span>
          </h2>
        </div>
        <p className="text-[11px] text-white/40 max-w-sm font-bold uppercase tracking-[0.2em] leading-relaxed">
          {/* Replaced jargon with a clean, descriptive message */}
          Your feed is updated. Discover the best picks shared by your peers today.
        </p>
      </div>
    </div>
  );
}