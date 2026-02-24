"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User as UserIcon, Camera, ChevronLeft, Star, 
  Loader2, Fingerprint, TrendingUp, Edit3, Mail, MapPin
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { getUserProfile, toggleFollow } from "@/lib/api/auth";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import Link from "next/link";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isMe = currentUser?._id === id;

  // --- IMAGE LOGIC: Same as your user/profile page ---
  const getProfileImage = (path: string) => {
    if (!path) return undefined;
    // Prepends backend URL if it's a relative local path
    return path.startsWith('http') ? path : `http://localhost:3000${path}`;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Calls your export const getUserProfile in lib/api/auth.ts
      const response = await getUserProfile(id as string);
      
      if (response.success && response.data) {
        // Matches the backend controller structure: { profile, picks }
        setProfile(response.data.profile);
        setPicks(response.data.picks || []);
      }
    } catch (err: any) {
      console.error("Node sync failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadData();
  }, [id, loadData]);

  const onFollowToggle = async () => {
    try {
      const res = await toggleFollow(id as string);
      if (res.success) loadData(); // Refresh to update following state
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const onDelete = async (pickId: string) => {
    // Standardized to 'delete' terminology
    if (!confirm("Delete this transmission?")) return;
    try {
      const response = await axiosInstance.delete(API.PICKS.DELETE(pickId));
      if (response.data.success) {
        setPicks((prev) => prev.filter((p) => p._id !== pickId));
      }
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#0B0C10] flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Loader2 className="text-[#D4FF33]" size={40} />
      </motion.div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Initializing Profile...</p>
    </div>
  );

  if (!profile) return <div className="h-screen flex items-center justify-center text-white font-mono">NODE_OFFLINE</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10] text-white selection:bg-[#D4FF33] selection:text-black pb-20 relative overflow-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className="p-8 flex items-center justify-between max-w-7xl mx-auto relative z-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#D4FF33] transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <Fingerprint size={14} className="text-[#D4FF33]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Node: {profile._id?.slice(-8).toUpperCase()}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER CARD --- */}
        <section className="relative mb-12">
          <div className="relative bg-gradient-to-br from-[#0F1116] to-[#1a1d29] border border-white/10 rounded-[3.5rem] p-10 md:p-16 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
              
              {/* Profile Picture */}
              <div className="relative group/avatar flex-shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#D4FF33] to-[#5D44F8] rounded-[3.2rem] blur opacity-20" />
                <div className="relative w-44 h-44 md:w-52 md:h-52 bg-[#0F1116] border-2 border-white/20 rounded-[3rem] overflow-hidden">
                  {profile.profilePicture ? (
                    <img 
                      src={getProfileImage(profile.profilePicture)} 
                      className="w-full h-full object-cover" 
                      alt={profile.fullName} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#161920]">
                      <UserIcon size={70} className="text-gray-800" strokeWidth={1} />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-[#D4FF33] text-black text-[9px] font-black uppercase tracking-widest rounded-full">Verified Peer</span>
                  <span className="px-4 py-1.5 bg-white/5 border border-white/20 rounded-full text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={12} className="text-[#D4FF33]" /> Impact {profile.followerCount * 12 || 0}
                  </span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">
                  {profile.fullName}
                </h1>

                <div className="flex justify-center lg:justify-start gap-12 mt-8">
                   <div>
                      <span className="block text-3xl font-black">{profile.followerCount || 0}</span>
                      <span className="text-[9px] uppercase text-gray-500 tracking-[0.2em] font-bold">Followers</span>
                   </div>
                   <div>
                      <span className="block text-3xl font-black">{profile.followingCount || 0}</span>
                      <span className="text-[9px] uppercase text-gray-500 tracking-[0.2em] font-bold">Following</span>
                   </div>
                </div>
              </div>

              {/* Follow / Edit Button */}
              <div className="w-full lg:w-auto">
                {isMe ? (
                  <Link href="/user/update-profile" className="px-10 py-6 bg-white/5 border border-white/20 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-[#D4FF33] hover:text-black transition-all">
                    <Edit3 size={18} /> Modify Identity
                  </Link>
                ) : (
                  <button 
                    onClick={onFollowToggle} 
                    className={`px-12 py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all ${
                      profile.isFollowing 
                        ? 'border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' 
                        : 'bg-[#D4FF33] text-black hover:scale-105 shadow-xl shadow-[#D4FF33]/20'
                    }`}
                  >
                    {profile.isFollowing ? "Unfollow" : "Establish Connection"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 flex items-center gap-4">
              System Transmissions <div className="h-px flex-1 bg-white/5" />
            </h3>
            
            <div className="grid gap-4">
              {picks.length > 0 ? (
                picks.map((pick) => (
                  <div key={pick._id} className="bg-[#0F1116] border border-white/5 p-8 rounded-[2.5rem] hover:border-[#D4FF33]/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-mono text-[#D4FF33]/40 uppercase tracking-widest">{pick.category || "General"}</span>
                      {isMe && (
                        <button onClick={() => onDelete(pick._id)} className="text-[9px] font-bold text-white/10 hover:text-red-500 uppercase tracking-widest">Delete</button>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">{pick.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-20 border border-dashed border-white/10 rounded-[2.5rem] text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.3em]">
                  No active data streams found.
                </div>
              )}
            </div>
          </div>

          {/* Achievement Sidebar */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#5D44F8] to-[#161920] border border-white/20 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-black/40 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20 relative z-10">
                <Star size={32} className="text-[#D4FF33] fill-[#D4FF33]" />
              </div>
              <h4 className="text-[14px] font-black uppercase tracking-widest mb-2 relative z-10">Elite Status</h4>
              <p className="text-[9px] text-white/50 uppercase font-bold tracking-widest relative z-10">Top consensus provider</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}