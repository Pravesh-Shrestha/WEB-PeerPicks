"use client";

import React from 'react';
import Sidebar from './components/sidebar';
import ProfilePanel from './components/shared/right-profile-card';
import { DashboardProvider } from '@/app/context/DashboardContext';


export default function UniversalDashboardLayout({ children }: { children: React.ReactNode }) {


  return (
    <DashboardProvider>
      {/* Root Container: #020203 ensures no grayish bleeding at the edges */}
      <div className="flex h-screen bg-[#020203] text-white overflow-hidden">
        
        {/* SIDEBAR: Bg matches root exactly */}
        <aside className="w-64 hidden lg:block border-r border-white/[0.03] bg-[#020203]">
          <Sidebar />
        </aside>

        {/* MAIN FEED: Scrollable area with the same background */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#020203]">
          <div className="max-w-[1600px] mx-auto w-full min-h-full px-4 md:px-8">
            {children}
          </div>
        </main>

        {/* RIGHT PANEL: Bg matches root exactly */}
        <aside className="w-80 hidden xl:block border-l border-white/[0.03] bg-[#020203]">
          <ProfilePanel />
        </aside>
      </div>
    </DashboardProvider>
  );
}