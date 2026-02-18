"use client";

import React from 'react';
import { Settings, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { handleLogout } from '@/lib/actions/auth-action';

export default function ProfilePanel({ user }: { user: any }) {
  const router = useRouter();

  const onLogout = async () => {
    await handleLogout();
    router.replace("/login");
  };

  const goToProfile = () => {
    router.push("/user/profile");
  };

  return (
    <aside className="w-80 p-8 hidden xl:flex flex-col border-l border-white/10 bg-[#0F1116]/50">
      <div className="rounded-[32px] p-8 border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          {/* Avatar Container */}
          <div className="relative w-24 h-24 rounded-[28px] bg-gradient-to-tr from-[#5D44F8] to-[#D4FF33] p-1 mb-6 shadow-2xl">
            <div className="w-full h-full rounded-[24px] bg-[#0B0C10] flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <UserIcon size={40} className="text-white/10" />
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-black uppercase italic tracking-tight mb-1">
            {user?.fullName || "Peer User"}
          </h3>
          <p className="text-[9px] text-[#D4FF33] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Shield size={10} /> Verified Peer
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {/* Settings / Profile Button */}
          <button 
            onClick={goToProfile}
            className="flex items-center justify-between w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 hover:border-[#D4FF33]/30 transition-all group"
          >
            Settings 
            <Settings size={14} className="text-gray-500 group-hover:text-[#D4FF33] transition-colors" />
          </button>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="flex items-center justify-between w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            Log Out <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-auto p-6 border border-dashed border-white/10 rounded-3xl">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 leading-relaxed text-center">
          Consensus Network v1.0.4<br/>
          <span className="text-[#D4FF33]/50">System Status: Operational</span>
        </p>
      </div>
    </aside>
  );
}