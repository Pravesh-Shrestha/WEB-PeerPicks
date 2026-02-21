"use client";

import React, { useState, useEffect, useCallback } from 'react';
import WelcomeHeader from './components/welcome-header';
import { PickCard } from './components/shared/pick-card';
import CreatePickTrigger from './components/shared/CreatePickTrigger';
import CreateReviewForm from './components/create_review_form'; 
import { getDiscoveryFeed } from '@/lib/actions/pick-action';
import { useAuth } from '@/app/context/AuthContext'; // Added Auth Context

export default function DashboardPage() {
  const { user } = useAuth(); // Get actual logged-in user
  const [activeTab, setActiveTab] = useState<'following' | 'new'>('new');
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const currentUserId = user?._id; 

  // Wrapped in useCallback to prevent unnecessary re-renders when passed to PickCard
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDiscoveryFeed(1, 10); 
      
      // FIX: Unwrap the 'data' array from the backend response object
      // Backend returns { success: true, data: [...] }
      if (result && result.success && Array.isArray(result.data)) {
        setPicks(result.data); 
      } else {
        setPicks([]);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
      setPicks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, activeTab]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <WelcomeHeader />
      
      <CreatePickTrigger onClick={() => setIsFormOpen(true)} />

      {/* Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
           {/* Removed overflow-y-auto from wrapper to prevent double scrollbars; 
               CreateReviewForm handles its own scrolling */}
           <div className="w-full max-w-4xl bg-[#09090B] rounded-[3rem] border border-white/10 shadow-2xl relative">
              <CreateReviewForm 
                onSuccess={() => {
                  setIsFormOpen(false);
                  fetchFeed(); // Refresh feed after new pick is created
                }} 
                onClose={() => setIsFormOpen(false)} 
              />
           </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 sticky top-0 bg-[#09090B]/80 backdrop-blur-md z-10">
        {['Following', 'New Picks'].map((tab) => {
          const id = tab.toLowerCase().includes('following') ? 'following' : 'new';
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === id ? 'text-[#D4FF33] border-b-2 border-[#D4FF33]' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Feed Content */}
      <div className="space-y-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="w-full aspect-square bg-white/5 animate-pulse rounded-[2.5rem]" />
          ))
        ) : picks.length > 0 ? (
          picks.map((pick) => (
            <PickCard
              key={pick._id}
              pick={pick}
              currentUserId={currentUserId}
              onDeleteSuccess={fetchFeed} // IMPORTANT: Fixed to refresh UI after deletion
            />
          ))
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-zinc-900/20">
            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">
              [ STATUS: NO_SIGNAL_IN_AREA ]
            </p>
          </div>
        )}
      </div>
    </div>
  );
}