"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import WelcomeHeader from './components/welcome-header';
import { PickCard } from './components/shared/pick-card';
import CreatePickTrigger from './components/shared/CreatePickTrigger';
import CreateReviewForm from './components/create_review_form'; 
import { getDiscoveryFeed } from '@/lib/actions/pick-action';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'following' | 'new'>('new');
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Ref to prevent concurrent requests during the same render cycle
  const isFetching = useRef(false);

  const fetchFeed = useCallback(async () => {
    // 1. SIGNAL GUARD: Don't fetch if already in progress or auth isn't ready
    if (isFetching.current || authLoading || !isAuthenticated) return;

    isFetching.current = true;
    setLoading(true);
    
    try {
      // Pass the activeTab to your action if your backend supports it
      const feedType = activeTab === 'following' ? 'following' : 'new';
      const result = await getDiscoveryFeed(1, 10, feedType); 
      
      if (result?.success && Array.isArray(result.data)) {
        setPicks(result.data); 
      } else {
        setPicks([]);
      }
    } catch (error) {
      console.error("FEED_FAILURE: SIGNAL_INTERRUPTED", error);
      setPicks([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [authLoading, isAuthenticated, activeTab]); // Dependencies are now stable

  // 2. Controlled Effect Loop
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, activeTab]); 

  const currentUserId = user?._id || user?.id;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <WelcomeHeader />
      
      <CreatePickTrigger onClick={() => setIsFormOpen(true)} />

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
           <div className="w-full max-w-4xl bg-[#09090B] rounded-[3rem] border border-white/10 shadow-2xl relative">
              <CreateReviewForm 
                onSuccess={() => {
                  setIsFormOpen(false);
                  fetchFeed(); 
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

      <div className="space-y-8">
        {loading && picks.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="w-full aspect-video bg-white/5 animate-pulse rounded-[2.5rem]" />
          ))
        ) : picks.length > 0 ? (
          picks.map((pick) => (
            <PickCard
              key={pick._id}
              pick={pick}
              currentUserId={currentUserId}
              // [2026-02-01] Protocol: Immediate UI sync after delete
              onDeleteSuccess={fetchFeed} 
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