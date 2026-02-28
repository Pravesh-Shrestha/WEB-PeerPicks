"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { followUser, unfollowUser } from "@/lib/api/auth";
import { PickCard } from "../../components/shared/pick-card";
import { getMediaUrl } from "@/lib/utils";
import { MapPin, Calendar, ShieldCheck, Loader2, Quote, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  // RANDOM_QUOTES: Refreshed on every visit
  const randomQuote = useMemo(() => {
    const quotes = [
      "Curating the best of the digital landscape.",
      "Quality over quantity, every single time.",
      "Building a library of worth-while discoveries.",
      "The best insights are often found between the lines.",
      "Connecting dots and sharing the results.",
      "Exploring the intersection of data and design.",
      "Everything shared here has a purpose."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(API.PICKS.USER_PICKS(userId));
        const profile = res?.data?.profile || null;
        setUser(profile);
        setPicks(res?.data?.picks || []);
        setIsFollowing(!!profile?.isFollowing);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black font-mono text-[#D4FF33]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <span className="tracking-[0.3em] uppercase text-sm font-bold">LOADING_PROFILE...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-500 font-mono text-lg tracking-widest uppercase text-center p-4">
        ERROR: USER_NOT_FOUND
      </div>
    );
  }

  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = !!currentUserId && currentUserId.toString() === (user?._id || user?.id || "").toString();

  const handleFollowToggle = async () => {
    if (isUpdatingFollow || isOwnProfile) return;

    const nextValue = !isFollowing;
    const previousCount = user?.followerCount || 0;

    setIsUpdatingFollow(true);
    setIsFollowing(nextValue);
    setUser((prev: any) => ({
      ...prev,
      followerCount: Math.max(0, previousCount + (nextValue ? 1 : -1)),
    }));

    try {
      const response = nextValue
        ? await followUser(userId)
        : await unfollowUser(userId);

      if (!response?.success) {
        throw new Error(response?.message || "Follow update failed");
      }
    } catch (error: any) {
      setIsFollowing(!nextValue);
      setUser((prev: any) => ({ ...prev, followerCount: previousCount }));
      toast.error(error?.message || "Could not update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  // Format full name for the handle (lowercase, no spaces)
  const formattedHandle = user.fullName?.toLowerCase().replace(/\s+/g, '_') || "unnamed";

  return (
    <div className="min-h-screen bg-black text-white pb-20 selection:bg-[#D4FF33] selection:text-black">
      {/* HEADER AREA */}
      <div className="relative h-48 w-full bg-[#0a0a0a] overflow-hidden border-b border-white/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        
        {/* IDENTITY BOX */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2rem] border-4 border-black overflow-hidden bg-zinc-900 shadow-2xl">
              <img
                src={getMediaUrl(user.profilePicture, "profilePicture")}
                className="w-full h-full object-cover"
                alt={user.fullName}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                {user.fullName}
              </h1>
              {user.isVerified && <ShieldCheck size={24} className="text-[#D4FF33]" />}
            </div>
            <p className="text-[#D4FF33] font-mono text-sm uppercase tracking-[0.3em] mt-2 font-bold">
              USER @{formattedHandle}
            </p>

            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={isUpdatingFollow}
                title={isFollowing ? "Unfollow this user" : "Follow this user"}
                aria-label={isFollowing ? "Unfollow this user" : "Follow this user"}
                className={`mt-4 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isFollowing
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    : "bg-[#D4FF33] text-black hover:brightness-95"
                } disabled:opacity-60`}
              >
                {isUpdatingFollow ? "Updating..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* BIO & DATA GRID */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          <div className="bg-white/10 border border-white/30 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-2 mb-5 text-white/50">
                <Quote size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profile_Bio</span>
            </div>
            
            <p className="text-white text-xl leading-tight font-semibold mb-8">
              {user.bio || randomQuote}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-white">
              <span className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl">
                <MapPin size={14} /> 
                {user.location || "Earth"}
              </span>
              <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/10">
                <Calendar size={14} /> 
                SINCE {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white text-black rounded-2xl p-6 text-center">
              <div className="text-4xl font-black">{picks.length}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">Posts</div>
            </div>
            <div className="flex-1 bg-[#D4FF33] text-black rounded-2xl p-6 text-center">
              <div className="text-4xl font-black">{user.followerCount || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">Followers</div>
            </div>
          </div>
        </div>

        {/* SECTION DIVIDER */}
        <div className="flex items-center gap-6 mb-10">
           <h2 className="text-base font-black uppercase tracking-[0.4em] text-white whitespace-nowrap">
             Recent posts
           </h2>
           <div className="h-[2px] flex-1 bg-white/20" />
        </div>

        {/* POSTS FEED */}
        <div className="space-y-8 max-w-lg mx-auto">
          {picks.length > 0 ? (
            picks.map((pick: any) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={pick._id}
              >
                <PickCard pick={pick} />
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-white/20 rounded-[3rem]">
              <UserIcon className="mx-auto mb-4 text-white/10" size={40} />
              <p className="text-white font-mono text-xs uppercase tracking-[0.3em]">
                NO_POSTS_YET
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}