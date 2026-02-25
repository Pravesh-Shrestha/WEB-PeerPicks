"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Zap,
  Terminal,
  LogOut,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import axiosInstance from "@/lib/api/axios";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Identity_Registry", href: "/admin/users", icon: Users },
  { label: "Signal_Picks", href: "/admin/picks", icon: Zap },

];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      // If you have a logout route
      await axiosInstance.post("/api/auth/logout");

      delete axiosInstance.defaults.headers.common["Authorization"];
      router.replace("/login");
    } catch {
      // fallback: just go home
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 bg-[#D4FF33] rounded flex items-center justify-center shadow-[0_0_20px_rgba(212,255,51,0.3)]">
          <Terminal className="text-black" size={20} />
        </div>
        <h1 className="text-lg font-black uppercase italic tracking-tighter">
          Admin<span className="text-[#D4FF33]">_Hub</span>
        </h1>
      </div>

{NAV_ITEMS.map((item) => {
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);

  return (
    <Link
      key={item.href}
      href={item.href}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
        isActive
          ? "bg-[#D4FF33] text-black shadow-[0_0_20px_rgba(212,255,51,0.2)]"
          : "text-zinc-500 hover:text-white hover:bg-white/5"
      }`}
    >
      <item.icon
        size={16}
        className={`transition-transform ${
          isActive ? "scale-110" : "group-hover:scale-105"
        }`}
      />
      {item.label}
    </Link>
  );
})}

      {/* FOOTER ACTIONS */}
      <div className="pt-6 border-t border-white/5 space-y-2">

        {/* BACK TO DASHBOARD */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl 
                     text-zinc-500 hover:text-white hover:bg-white/5 
                     transition-all duration-200 
                     text-[11px] font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Back_To_Dashboard
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl 
                     text-zinc-500 hover:text-red-500 hover:bg-red-500/10 
                     transition-all duration-200 
                     text-[11px] font-bold uppercase tracking-widest 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loggingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
          {loggingOut ? "Terminating..." : "Exit_Session"}
        </button>
      </div>
    </div>
  );
}