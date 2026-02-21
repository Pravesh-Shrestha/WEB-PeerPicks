"use client";

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function WelcomeHeader() {
  const { user, loading } = useAuth();

  // 1. Loading State (Prevents 'User' flicker)
  if (loading) {
    return (
      <div className="bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 mb-8 animate-pulse">
        <div className="h-8 w-64 bg-white/5 rounded-lg mb-2" />
        <div className="h-3 w-40 bg-white/5 rounded-lg" />
      </div>
    );
  }

  // 2. Data State
  return (
    <div className="bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group">
      {/* Design Polish: Subtle Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF33]/5 blur-[50px] -mr-16 -mt-16 rounded-full" />
      
      <div className="relative z-10 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">
            Welcome back, <span className="text-[#D4FF33]">{user?.fullName || 'Peer'}</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Check what's happening in your network
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Status</span>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-black text-[#D4FF33] uppercase">Online</span>
            <div className="w-2 h-2 rounded-full bg-[#D4FF33] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}