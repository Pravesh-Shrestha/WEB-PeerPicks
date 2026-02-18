"use client";

import { DashboardProvider, useDashboard } from '../../context/DashboardContext';
import Sidebar from './components/sidebar';
import ProfilePanel from './components/profile_panel';
import { useAuth } from '@/app/context/AuthContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { openModal } = useDashboard();
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#0B0C10] text-white overflow-hidden font-sans">
      <aside className="hidden md:block">
        {/* Now the button works! */}
        <Sidebar onOpenCreate={openModal} />
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="min-h-full bg-gradient-to-b from-[#0B0C10] to-[#0F1116]">
          {children}
        </div>
      </main>

      <aside className="hidden xl:block">
        <ProfilePanel user={user} />
      </aside>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}