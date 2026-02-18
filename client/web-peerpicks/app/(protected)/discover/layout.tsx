"use client";

import { useAuth } from "@/app/context/AuthContext";
import { DashboardProvider, useDashboard } from "@/app/context/DashboardContext";
import Sidebar from "../dashboard/components/sidebar";
import ProfilePanel from "../dashboard/components/profile_panel";
import CreateReviewModal from "../dashboard/components/create-review-modal";



function DiscoverLayoutContent({ children }: { children: React.ReactNode }) {
  const { isModalOpen, closeModal, openModal, triggerRefresh } = useDashboard();
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#0B0C10] text-white overflow-hidden font-sans">
      {/* FIXED LEFT SIDEBAR */}
      <aside className="hidden md:block h-full border-r border-white/5">
        <Sidebar onOpenCreate={openModal} />
      </aside>

      {/* SCROLLABLE MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative">
        <div className="min-h-full bg-gradient-to-b from-[#0B0C10] to-[#08080A]">
          {children}
        </div>
      </main>

      {/* FIXED RIGHT PROFILE PANEL */}
      <aside className="hidden xl:block h-full border-l border-white/5 bg-[#0C0C0E]">
        <ProfilePanel user={user} />
      </aside>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <CreateReviewModal 
          onClose={closeModal} 
          refreshFeed={triggerRefresh} 
        />
      )}
    </div>
  );
}

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DiscoverLayoutContent>{children}</DiscoverLayoutContent>
    </DashboardProvider>
  );
}