"use client";

import { useEffect, useState } from "react";
import { getDiscoveryFeed } from "@/lib/actions/pick-actions";
import { PickCard } from "./shared/pick-card"; // Adjusted to match your folder structure

interface FeedContentProps {
  filter: 'all' | 'following';
}

export default function FeedContent({ filter }: FeedContentProps) {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Synchronizing with the dashboard's filter state
      const result = await getDiscoveryFeed(filter);
      
      if (result.success) {
        // Ensuring we grab the data array from the signal response
        setPicks(result.data || []);
      }
    } catch (error) {
      console.error("Consensus Transmission Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]); // Re-fetches when toggling Home vs Following

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#D4FF33]/10 border-t-[#D4FF33] rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-[#D4FF33]/5 rounded-full blur-sm" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4FF33] animate-pulse">
          Synchronizing Data Nodes...
        </p>
      </div>
    );
  }

  if (!picks || picks.length === 0) {
    return (
      <div className="py-24 text-center border border-white/5 rounded-[40px] bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="mb-4 opacity-20 flex justify-center">
          <div className="w-1 h-8 bg-[#D4FF33] rounded-full animate-bounce" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
          No Intelligence Detected in this Sector
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-32">
      {picks.map((pick: any) => (
        <PickCard 
          key={pick._id} 
          pick={pick} 
          onUpdate={loadData} // Triggers re-fetch on delete
        />
      ))}
    </div>
  );
}