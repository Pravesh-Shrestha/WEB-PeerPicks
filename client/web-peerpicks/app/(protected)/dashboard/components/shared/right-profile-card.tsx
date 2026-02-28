"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { User as UserIcon, LogOut, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RightProfileCard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const executeLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

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
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-3 bg-white/[0.03] text-zinc-500 py-4.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-white/[0.05] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all duration-300"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          />
          <div className="relative bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                Confirm_Logout
              </h2>
              <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
                Are you sure you want to end your session now?
              </p>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isLoggingOut}
                onClick={executeLogout}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? <Loader2 size={14} className="animate-spin" /> : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER LEGAL */}
      <div className="mt-12 pt-8 border-t border-white/[0.05] w-full text-center space-y-2">
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em]">
          © {new Date().getFullYear()} PeerPicks. All rights reserved.
        </p>
        <p className="text-[8px] text-zinc-600 font-semibold uppercase tracking-[0.18em]">
          PeerPicks™ is a trademark concept.
        </p>
      </div>
    </div>
  );
}