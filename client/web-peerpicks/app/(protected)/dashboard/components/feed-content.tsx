"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { PickCard } from "./shared/pick-card";
import { getDiscoveryFeed } from "@/lib/actions/pick-action";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboard } from "@/app/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FeedProps {
  type: "foryou" | "following";
}

export default function FeedContent({ type }: FeedProps) {
  const { user } = useAuth();
  const { refreshTicket } = useDashboard();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Ref for Infinite Scroll trigger
  const observerTarget = useRef(null);

  // 1. INSTANT REMOVAL LOGIC
  const handleRemoveCard = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  }, []);

  // 2. SUCCESS NOTIFICATION HANDLER
  // Called by PickCard to trigger the global Sonner toast at the top
  const handleSaveSuccess = useCallback(() => {
    toast.success("SIGNAL SAVED", {
      description: "ARCHIVED TO REPOSITORY",
      icon: <div className="w-1.5 h-1.5 bg-[#D4FF33] rounded-full animate-pulse" />,
    });
  }, []);

  const fetchFeedData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setPage(1);
      setHasMore(true);
    }

    const currentPage = isInitial ? 1 : page;
    
    try {
      const mappedType = type === "following" ? "following" : "new";
      const result = await getDiscoveryFeed(currentPage, 10, mappedType);
      const newPosts = result?.data || (Array.isArray(result) ? result : []);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => (isInitial ? newPosts : [...prev, ...newPosts]));
        setPage((prev) => (isInitial ? 2 : prev + 1));
      }
    } catch (error: any) {
      console.error("Feed Fetch Error:", error);
      // Handle Rate Limiting visually
      if (error.response?.status === 429) {
        toast.error("SYSTEM OVERLOAD", {
          description: "RATE LIMIT DETECTED. RETRYING...",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  // 3. INFINITE SCROLL OBSERVER (With Loading Guard)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Essential check: prevents 429 errors by ensuring only one fetch happens at a time
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchFeedData();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchFeedData, hasMore, loading]);

  // Initial Sync
  useEffect(() => {
    fetchFeedData(true);
  }, [refreshTicket, fetchFeedData]);

  if (loading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full aspect-[4/5] bg-[#09090B] border border-white/[0.03] animate-pulse rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-24 max-w-2xl mx-auto">
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <motion.div
            key={post._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
          >
            <PickCard
              pick={post}
              onDeleteSuccess={() => handleRemoveCard(post._id)}
              onSaveSuccess={handleSaveSuccess} 
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* INFINITE SCROLL TRIGGER */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {hasMore && posts.length > 0 && (
          <div className="w-2 h-2 rounded-full bg-[#D4FF33] animate-ping" />
        )}
      </div>
    </div>
  );
}