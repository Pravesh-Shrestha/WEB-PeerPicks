"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Bell, Heart, Settings } from "lucide-react";
import { useDashboard } from "@/app/context/DashboardContext";
import { useLanguage } from "@/app/context/LanguageContext";

interface SidebarProps {
  onOpenCreate?: () => void;
}

// Ensure these IDs match the keys in your DICTIONARY exactly
const navigation = [
  { id: "home", href: "/dashboard", icon: Home },
  { id: "discover", href: "/dashboard/discover", icon: LayoutGrid },
  { id: "notifications", href: "/dashboard/notifications", icon: Bell },
  { id: "favorites", href: "/dashboard/favorites", icon: Heart },
  { id: "settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ onOpenCreate }: SidebarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { unreadCount } = useDashboard();

  return (
    <aside className="w-72 border-r border-white/[0.02] bg-[#020203] flex flex-col h-screen sticky top-0 z-50 overflow-hidden">
      <div className="pt-2 pb-0 px-4 flex justify-center overflow-hidden">
        <Link href="/dashboard" className="group relative w-full flex justify-center">
          <div suppressHydrationWarning={true} className="relative w-56 h-56 transition-all duration-700 ease-out group-hover:scale-105">
            <Image src="/logo2.png" alt="Brand Logo" fill className="object-contain drop-shadow-[0_0_35px_rgba(212,255,51,0.08)]" priority />
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-6 pt-0 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const isNotifications = item.id === "notifications";

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 relative ${
                isActive
                  ? "bg-[#D4FF33] text-black shadow-[0_10px_30px_-10px_rgba(212,255,51,0.3)]"
                  : "text-zinc-600 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <div className="relative">
                <item.icon size={18} strokeWidth={isActive ? 3 : 2} />
                {isNotifications && unreadCount > 0 && (
                  <span className={`absolute -top-2 -right-2 flex h-4 min-w-[1rem] items-center justify-center px-1 rounded-full text-[8px] font-black transition-all duration-300 animate-in zoom-in ${
                    isActive ? "bg-black text-[#D4FF33]" : "bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  }`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              
              {/* This looks for DICTIONARY[lang].nav[item.id] */}
              {t(`nav.${item.id}`)}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 mt-auto">
        <div className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#09090B] rounded-2xl border border-white/[0.05]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF33] animate-pulse shadow-[0_0_8px_#D4FF33]" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            {t('common.status')}
          </span>
        </div>
      </div>
    </aside>
  );
}