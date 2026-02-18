"use client";

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { useDashboard } from "../../context/DashboardContext";
import FeedContent from './components/feed-content';
import WelcomeHeader from './components/welcome-header';
import CreateReviewModal from './components/create-review-modal';

export default function PeerPicksDashboard() {
  const { user } = useAuth();
  const { isModalOpen, closeModal, refreshKey, triggerRefresh } = useDashboard();
  const [feedSection, setFeedSection] = useState<'for-you' | 'following'>('for-you');

  const firstName = user?.fullName?.split(' ')[0] || 'Peer';

  return (
    <div className="relative">
      <div className="max-w-[630px] mx-auto py-12 px-4">
        <WelcomeHeader name={firstName} />

        {/* Feed Section Tabs */}
        <div className="flex gap-10 mb-10 border-b border-white/5">
          {["for-you", "following"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFeedSection(tab as any)}
              className={`pb-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
                feedSection === tab ? "text-[#D4FF33]" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === 'for-you' ? 'Home' : 'Following'}
            </button>
          ))}
        </div>

        <FeedContent 
          key={`${feedSection}-${refreshKey}`} 
          filter={feedSection === 'for-you' ? 'all' : 'following'} 
        />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateReviewModal 
            onClose={closeModal} 
            refreshFeed={() => {
              triggerRefresh();
              setFeedSection('for-you');
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}