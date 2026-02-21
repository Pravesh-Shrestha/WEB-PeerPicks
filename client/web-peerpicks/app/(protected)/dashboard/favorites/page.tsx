"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { PickCard } from "../components/shared/pick-card";
import { useAuth } from "@/app/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [favoritePicks, setFavoritePicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref to track if a fetch is already in flight to prevent 429s
  const isFetching = useRef(false);

  const fetchFavorites = useCallback(async () => {
    if (isFetching.current) return; // Guard: prevent overlapping requests
    
    isFetching.current = true;
    try {
      const response = await axiosInstance.get(API.PICKS.MY_FAVORITES);
      const data = response?.data?.data || response?.data || [];
      setFavoritePicks(data);
    } catch (error: any) {
      console.error("Archive Sync Failed:", error.response?.status === 429 
        ? "Rate limit exceeded (429). Please wait."
        : error.message
      );
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Instant UI removal instead of full refetch to save API calls
  const handleRemoveFromUI = useCallback((postId: string) => {
    setFavoritePicks((prev) => prev.filter((pick) => pick._id !== postId));
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchFavorites();
    }
  }, [authLoading, fetchFavorites]);

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="animate-pulse space-y-8">
           <div className="h-10 w-48 bg-white/5 rounded-lg" />
           <div className="h-64 w-full bg-white/5 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white">Saved Picks</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
          Your Personal Archive
        </p>
      </div>

      {favoritePicks.length > 0 ? (
        <div className="flex flex-col gap-10">
          <AnimatePresence mode="popLayout">
            {favoritePicks.map((pick: any) => (
              <motion.div
                key={pick._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <PickCard 
                  pick={pick} 
                  currentUserId={user?.id}
                  // OPTIMIZATION: Remove from UI locally first
                  // This stops the 429 errors from refetching too often
                  onDeleteSuccess={() => handleRemoveFromUI(pick._id)} 
                  initialIsFavorited={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="border-2 border-dashed border-white/5 rounded-[3.5rem] py-40 flex flex-col items-center justify-center text-center">
          <div className="bg-white/5 p-6 rounded-full mb-6">
            <p className="text-zinc-500 font-black text-2xl">!</p>
          </div>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm">
            No Saved Picks Detected
          </p>
          <p className="text-zinc-800 text-[10px] mt-2 uppercase tracking-tighter">
            User : {user?.email}
          </p>
        </div>
      )}
    </div>
  );
}