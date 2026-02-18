"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, Heart, Bell, PlusSquare, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  onOpenCreate: () => void;
}

export default function Sidebar({ onOpenCreate }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
    { id: 'discover', label: 'Discover', icon: Compass, href: '/discover' },
    { id: 'favorites', label: 'Favorites', icon: Heart, href: '/favorites' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications' },
  ];

  return (
    <div className="w-72 border-r border-white/5 h-screen flex flex-col p-8 bg-[#0B0C10] sticky top-0 z-40">
      {/* Brand Identity */}
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-[#D4FF33] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,255,51,0.2)]">
          <ShieldCheck size={20} className="text-black" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
          Peer<span className="text-[#D4FF33]">Picks</span>
        </h1>
      </div>
      
      {/* Main Navigation */}
      <nav className="space-y-3 flex-1">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 px-2">
          Menu
        </p>
        
        {menuItems.map((item) => {
          // Check if the current path matches the item href
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#D4FF33]/10 border border-[#D4FF33]/20' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon 
                size={20} 
                className={`transition-colors ${
                  isActive ? 'text-[#D4FF33]' : 'text-gray-400 group-hover:text-[#D4FF33]'
                }`} 
              />
              <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4FF33] shadow-[0_0_10px_#D4FF33]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Action Zone */}
      <div className="pt-8 border-t border-white/5 space-y-6">
        {/* Create Review Trigger */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onOpenCreate();
          }}
          className="w-full bg-[#D4FF33] text-black py-5 rounded-[24px] font-black uppercase italic tracking-tighter text-lg shadow-[0_10px_40px_rgba(212,255,51,0.15)] hover:bg-[#e1ff66] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
        >
          <PlusSquare size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          Create Review
        </button>
      </div>
    </div>
  );
}