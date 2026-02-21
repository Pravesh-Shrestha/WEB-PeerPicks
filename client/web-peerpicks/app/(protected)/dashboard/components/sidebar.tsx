"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  LayoutGrid, 
  Bell, 
  Heart, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  onOpenCreate?: () => void;
}

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Discover', href: '/dashboard/discover', icon: LayoutGrid },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Favorites', href: '/dashboard/favorites', icon: Heart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ onOpenCreate }: SidebarProps) {
  const pathname = usePathname();

  return (
    /* Change: Background set to #020203 and border opacity reduced for total blend */
    <aside className="w-72 border-r border-white/[0.02] bg-[#020203] flex flex-col h-screen sticky top-0 z-50 overflow-hidden">
      
      {/* BRAND LOGO - Docked to Top */}
      <div className="pt-2 pb-0 px-4 flex justify-center overflow-hidden">
        <Link href="/dashboard" className="group relative w-full flex justify-center">
          <div suppressHydrationWarning={true} 
          className="relative w-56 h-56 transition-all duration-700 ease-out group-hover:scale-105">
            <Image 
              src="/logo2.png" 
              alt="Brand Logo"
              fill
              className="object-contain drop-shadow-[0_0_35px_rgba(212,255,51,0.08)]"
              priority 
            />
          </div>
        </Link>
      </div>

      {/* Navigation Links - Zero gap from logo container */}
      <nav className="flex-1 px-6 pt-0 space-y-2"> 
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                isActive 
                  ? 'bg-[#D4FF33] text-black shadow-[0_10px_30px_-10px_rgba(212,255,51,0.3)]' 
                  /* Change: Inactive links now use bg-transparent to blend into #020203 */
                  : 'text-zinc-600 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 3 : 2} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Network Status Utility */}
      <div className="p-8 mt-auto">
        {/* Change: Utility box uses #09090B to look like it's floating on the black base */}
        <div className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#09090B] rounded-2xl border border-white/[0.05]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF33] animate-pulse shadow-[0_0_8px_#D4FF33]" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Protocol Secured</span>
        </div>
      </div>
    </aside>
  );
}