"use client";

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Image as ImageIcon, Plus, MapPin } from 'lucide-react';

interface CreatePickTriggerProps {
  onClick: () => void;
}

export default function CreatePickTrigger({ onClick }: CreatePickTriggerProps) {
  const { user } = useAuth();

  return (
    <div className="bg-[#121214] border border-white/5 rounded-[2rem] p-4 md:p-6 mb-8 transition-all hover:border-white/10 shadow-xl shadow-black/20">
      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#D4FF33] overflow-hidden bg-zinc-900 shrink-0">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-800 font-bold">
              {user?.fullName?.charAt(0) || "P"}
            </div>
          )}
        </div>

        {/* Fake Input Area */}
        <button 
          onClick={onClick}
          className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-500 text-left px-6 py-3 md:py-4 rounded-full text-xs md:text-sm font-medium transition-colors border border-transparent hover:border-white/5"
        >
          What's the latest pick, {user?.fullName?.split(' ')[0] || 'Peer'}?
        </button>

        {/* Quick Action Button */}
        <button 
          onClick={onClick}
          className="w-10 h-10 md:w-12 md:h-12 bg-[#D4FF33] text-black rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90 shrink-0 shadow-lg shadow-[#D4FF33]/10"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Decorative Quick Links */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 px-2">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest cursor-pointer hover:text-white transition-colors">
            <ImageIcon size={14} className="text-[#D4FF33]" /> Add Photo
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest cursor-pointer hover:text-white transition-colors">
            <MapPin size={14} className="text-[#D4FF33]" /> Location
         </div>
      </div>
    </div>
  );
}