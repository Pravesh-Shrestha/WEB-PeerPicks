"use client";
import React from "react";
import Sidebar from "./_components/sidebar";
import AdminNav from "./_components/admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Logic: Insert your Auth check here. If not admin, redirect to /
  
  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      {/* SIDEBAR - Fixed Width */}
      <aside className="w-72 border-r border-white/5 bg-[#0A0A0A] hidden lg:block">
        <Sidebar />
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Animated Grid Overlay for that "Terminal" look */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <AdminNav />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}