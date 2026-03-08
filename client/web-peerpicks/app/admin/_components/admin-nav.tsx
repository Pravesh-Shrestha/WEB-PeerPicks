"use client";
import React from 'react';
import { Search, Bell, Command, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext'; // Subscribe to your context
import { getMediaUrl } from '@/lib/utils';

export default function AdminNav() {
  const { user, loading } = useAuth(); // Get data from global state

  const getAvatarUrl = () => {
    if (user?.profilePicture) {
      return getMediaUrl(user.profilePicture, 'profilePicture');
    }
    const encodedName = encodeURIComponent(user?.fullName || 'Admin');
    return `https://ui-avatars.com/api/?name=${encodedName}&background=D4FF33&color=000&bold=true`;
  };

  return (
    <header className="h-20 border-b border-white/5 bg-[#0A0A0B]/50 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
      {/* SEARCH BAR (Visual only for now) */}
      <div className="relative w-96 group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#D4FF33]">
          <Search size={16} />
        </div>
        <input 
          type="text"
          placeholder="Search_Database..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-mono focus:outline-none focus:border-[#D4FF33]/50 focus:ring-1 focus:ring-[#D4FF33]/20 transition-all text-white placeholder:text-zinc-700"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#D4FF33] rounded-full shadow-[0_0_10px_#D4FF33]"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right">
            {loading ? (
              <div className="h-3 w-24 bg-white/5 animate-pulse rounded" />
            ) : (
              <>
                <p className="text-xs font-bold text-white leading-none">
                  {user?.fullName || "UNKNOWN_OPERATOR"}
                </p>
                <p className="text-[9px] text-[#D4FF33] font-mono uppercase mt-1.5 tracking-tighter">
                  {user?.role === 'admin' ? "Root_Access_Granted" : "Limited_Auth_Level"}
                </p>
              </>
            )}
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
            {loading ? (
              <Loader2 size={16} className="text-[#D4FF33] animate-spin" />
            ) : (
              <img 
                src={getAvatarUrl()} 
                alt="Identity_Biometrics"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}