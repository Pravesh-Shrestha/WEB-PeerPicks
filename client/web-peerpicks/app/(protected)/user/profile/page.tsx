"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { PickCard } from "../../dashboard/components/shared/pick-card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Inbox, Fingerprint, ChevronLeft, 
  User as UserIcon, Grid, Bookmark 
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userPicks, setUserPicks] = useState<any[]>([]);
  const [savedPicks, setSavedPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"PICKS" | "SAVED">("PICKS");

  // YOUR ORIGINAL LOGIC - UNTOUCHED
  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [picksRes, savedRes] = await Promise.all([
        axiosInstance.get(API.PICKS.USER_PICKS(user.id)),
        axiosInstance.get(API.PICKS.MY_FAVORITES),
      ]);

      const picks = picksRes?.data?.picks || [];
      const saved = savedRes?.data || [];

      setUserPicks(picks);
      setSavedPicks(saved);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchProfileData();
  }, [user?.id]);

  if (authLoading || (loading && userPicks.length === 0)) {
    return (
      <div className="h-screen w-full bg-[#0B0C10] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-[#D4FF33] animate-spin" size={32} />
        <p className="text-[10px] font-mono text-[#D4FF33] uppercase tracking-[0.3em]">Accessing_Node_Data...</p>
      </div>
    );
  }

  const data = tab === "PICKS" ? userPicks : savedPicks;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white pb-24 selection:bg-[#D4FF33] selection:text-black">
      {/* NAVIGATION */}
      <nav className="p-8 flex items-center justify-between max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-[#D4FF33] transition-colors tracking-tighter">
          <ChevronLeft size={16} /> Return_to_Network
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
          <Fingerprint size={14} className="text-[#D4FF33]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">
            Node_ID: {user?.id?.substring(0, 8)}
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* HERO SECTION - REFINED CURVES */}
        <section className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 rounded-[1.5rem] p-10 mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Avatar with Professional Radius */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <UserIcon size={40} />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-[#D4FF33]/10 border border-[#D4FF33]/20 rounded-full mb-3">
                <span className="text-[9px] font-black text-[#D4FF33] uppercase tracking-[0.2em]">Verified_Node</span>
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
                {user?.fullName || "Active_Peer"}
              </h1>
              <div className="flex justify-center md:justify-start gap-10 font-mono">
                <StatBox value={userPicks.length} label="Signals" />
                <StatBox value={user?.reputation || 0} label="Reputation" />
              </div>
            </div>

            <Link href="/user/update-profile" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all duration-300 shadow-lg">
              Modify_Identity
            </Link>
          </div>
        </section>

        {/* TAB NAVIGATION */}
        <div className="flex justify-center gap-12 border-b border-white/5 mb-10">
          <TabButton 
            active={tab === "PICKS"} 
            icon={<Grid size={14}/>} 
            label={`Picks [${userPicks.length}]`} 
            onClick={() => setTab("PICKS")} 
          />
          <TabButton 
            active={tab === "SAVED"} 
            icon={<Bookmark size={14}/>} 
            label={`Saved [${savedPicks.length}]`} 
            onClick={() => setTab("SAVED")} 
          />
        </div>

        {/* CONTENT GRID */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data.length > 0 ? (
              data.map((item: any) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="group"
                >
                  {/* The PickCard radius can be overridden via className if your component allows, 
                      otherwise ensure the component internal div uses rounded-2xl or rounded-xl */}
                  <PickCard 
                    pick={item} 
                    currentUserId={user?._id}
                    initialIsFavorited={tab === "SAVED"}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Inbox size={32} className="text-zinc-800 mb-4" />
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  No_Data_Packets_Found
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Design Helper Components
function StatBox({ value, label }: { value: number | string, label: string }) {
  return (
    <div>
      <span className="block text-2xl font-black text-white">{value}</span>
      <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">{label}</span>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`pb-4 text-[10px] font-bold tracking-[0.15em] transition-all relative flex items-center gap-2 ${
        active ? "text-[#D4FF33]" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon} {label.toUpperCase()}
      {active && (
        <motion.div 
          layoutId="profile-tab-active" 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4FF33] shadow-[0_0_10px_#D4FF33]" 
        />
      )}
    </button>
  );
}