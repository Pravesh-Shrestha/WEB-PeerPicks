"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { PickCard } from "../components/shared/pick-card";
import { useAuth } from "@/app/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Inbox } from "lucide-react";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [favoritePicks, setFavoritePicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchFavorites = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const response: any = await axiosInstance.get(API.PICKS.MY_FAVORITES);
      const data = response?.data?.data || response?.data || response || [];
      setFavoritePicks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Archive Sync Failed");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  const handleRemoveFromUI = useCallback((postId: string) => {
    // This state change triggers the AnimatePresence 'exit'
    setFavoritePicks((prev) => prev.filter((pick) => pick._id !== postId));
  }, []);

  useEffect(() => {
    if (!authLoading) fetchFavorites();
  }, [authLoading, fetchFavorites]);

  if (authLoading || loading) return <div className="p-12 text-[#D4FF33] font-mono">LOADING_ARCHIVE...</div>;

  return (
    <div className="w-full py-12 px-8 lg:px-12 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-10">
        <div className="flex items-center gap-3">
          <Bookmark className="text-[#D4FF33]" size={24} />
          <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter">Saved_Archive</h1>
        </div>
      </div>

      <div className="relative md:pl-16">
        <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/5 hidden md:block" />

        {/* CRITICAL: AnimatePresence must wrap the conditional/map 
          to track components being added/removed.
        */}
        <AnimatePresence mode="popLayout">
          {favoritePicks.length > 0 ? (
            <div className="flex flex-col gap-8">
              {favoritePicks.map((pick) => (
                <motion.div
                  key={pick._id} // Required for AnimatePresence to track specific items
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ 
                    opacity: 0, 
                    x: -100, 
                    filter: "blur(10px)",
                    transition: { duration: 0.3, ease: "easeInOut" } 
                  }}
                >
                  <PickCard 
                    pick={pick} 
                    currentUserId={user?._id || user?.id}
                    onDeleteSuccess={() => handleRemoveFromUI(pick._id)} 
                    initialIsFavorited={true}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-start p-16 border border-dashed border-white/5 rounded-[3rem]"
            >
              <Inbox size={32} className="text-zinc-700 mb-4" />
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Archive_Empty</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}