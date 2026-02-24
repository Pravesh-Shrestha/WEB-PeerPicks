"use client";

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { User as UserIcon, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RightProfileCard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Unified color variables for internal consistency
  const colors = {
    base: "#020203",
    surface: "#09090B",
    neon: "#D4FF33"
  };

  // 1. SKELETON STATE: Matches the new #020203 depth
  if (loading) {
    return (
      <div className="bg-[#020203] p-8 flex flex-col items-center animate-pulse sticky top-8">
        <div className="w-24 h-24 rounded-full bg-white/[0.03] mb-6" />
        <div className="h-6 w-32 bg-white/[0.03] rounded-lg mb-2" />
        <div className="h-3 w-20 bg-white/[0.03] rounded-lg mb-8" />
        <div className="w-full space-y-3">
          <div className="h-12 w-full bg-white/[0.03] rounded-2xl" />
          <div className="h-12 w-full bg-white/[0.03] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null; 

  return (
    <div className="bg-[#020203] p-8 flex flex-col items-center sticky top-8 transition-all duration-500">
      
      {/* PROFILE IMAGE SECTION */}
      <div className="relative mb-8">
        {/* Glow effect behind profile */}
        <div className="absolute inset-0 bg-[#D4FF33]/10 blur-2xl rounded-full" />
        
        <div className="relative w-28 h-28 rounded-full border-[3px] border-[#D4FF33] overflow-hidden bg-[#09090B] shadow-2xl shadow-black">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.fullName} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-[#09090B]">
              <UserIcon size={40} />
            </div>
          )}
        </div>
        
        {/* Status Indicator - Integrated into the frame */}
        <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#D4FF33] rounded-full border-[4px] border-[#020203] flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
        </div>
      </div>

      {/* USER IDENTITY */}
      <div className="text-center mb-10">
        <h3 className="text-xl font-black uppercase italic text-white tracking-widest leading-tight">
          {user.fullName}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-3">
          <ShieldCheck size={12} className="text-[#D4FF33]" />
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">
            {user.role || "Verified Peer"}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="w-full space-y-3">
        <button 
          onClick={() => router.push(`/user/profile`)}
          className="group w-full flex items-center justify-center gap-3 bg-[#D4FF33] text-black py-4.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-[#D4FF33]/10"
        >
          View Profile
          <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 bg-white/[0.03] text-zinc-500 py-4.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-white/[0.05] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all duration-300"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* FOOTER STATS */}
      <div className="mt-12 pt-8 border-t border-white/[0.05] w-full grid grid-cols-2 gap-4">
          <div className="text-center border-r border-white/[0.05]">
            <span className="block text-white text-base font-black italic">1.2k</span>
            <span className="block text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">Picks</span>
          </div>
          <div className="text-center">
            <span className="block text-[#D4FF33] text-base font-black italic">98%</span>
            <span className="block text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">Trust</span>
          </div>
      </div>
    </div>
  );
}