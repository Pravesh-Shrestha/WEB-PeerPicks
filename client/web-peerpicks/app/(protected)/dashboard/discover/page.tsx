"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Loader2, MessageCircle, Star, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDashboard } from '@/app/context/DashboardContext';
import { getDiscoveryFeed } from '@/lib/actions/pick-action'; 
import { getMediaUrl } from '@/lib/utils';

const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  { id: 'FOOD', label: 'Dining' },
  { id: 'CAFE', label: 'Coffee' },
  { id: 'NIGHTLIFE', label: 'Nightlife' },
  { id: 'SHOPPING', label: 'Retail' },
  { id: 'OUTDOORS', label: 'Nature' },
  { id: 'CULTURE', label: 'Museums' },
  { id: 'STREET_ART', label: 'Street Art' },
  { id: 'HIDDEN_GEM', label: 'Hidden Gems' }
];

export default function DiscoverPage() {
  const { refreshTicket } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [picks, setPicks] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const loadPicks = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getDiscoveryFeed(1, 50); 
      setPicks(result?.data || []);
    } catch (error) {
      setPicks([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPicks(); }, [loadPicks, refreshTicket]);

  const filteredPicks = useMemo(() => {
    return picks.filter(pick => {
      const content = `${pick.alias} ${pick.locationName}`.toLowerCase();
      const matchesSearch = content.includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'ALL' || pick.category?.toUpperCase() === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [picks, searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#020203]/80 backdrop-blur-xl border-b border-white/[0.05] py-6">
        <div className="max-w-[1400px] mx-auto space-y-6 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-xl font-black uppercase tracking-[0.3em] text-[#D4FF33]">Discover</h1>
            <Link
              href="/dashboard/nearby"
              className="px-4 py-2 rounded-lg border border-[#D4FF33]/40 text-[#D4FF33] text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4FF33]/10 transition-all"
            >
              Nearby Picks
            </Link>
            <div className="relative w-full max-w-lg group">
              {/* Icon set to white */}
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white group-focus-within:text-[#D4FF33]" size={16} />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // text-white and placeholder:text-white/40
                className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 pl-14 pr-6 text-sm focus:outline-none focus:border-[#D4FF33]/40 transition-all text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                // Inactive text color set to text-white
                className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  activeCategory === cat.id 
                    ? 'bg-[#D4FF33] text-black border-[#D4FF33]' 
                    : 'bg-[#09090B] text-white border-white/5 hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MASONRY GRID */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <Loader2 className="animate-spin text-[#D4FF33]" size={32} />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Loading...</span>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {filteredPicks.map((pick) => (
              <PinterestCard key={pick._id} pick={pick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PinterestCard({ pick }: { pick: any }) {
  const router = useRouter();
  const mediaUrl = getMediaUrl(pick.mediaUrls?.[0] || pick.images?.[0], 'pick');
  const isVideo = mediaUrl?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div 
      onClick={() => router.push(`/dashboard/picks/${pick._id}`)} 
      className="break-inside-avoid group cursor-pointer relative"
    >
      <div className="relative rounded-2xl overflow-hidden bg-[#09090B] border border-white/[0.05] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(212,255,51,0.1)]">
        {isVideo ? (
          <video 
            src={mediaUrl} 
            muted 
            loop 
            autoPlay 
            playsInline 
            className="w-full h-auto block" 
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt="" 
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
          <div className="flex justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); }}
              className="bg-[#D4FF33] text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-tighter hover:scale-105 transition-transform"
            >
              Save
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
              <Star size={10} className="fill-[#D4FF33] text-[#D4FF33]" />
              <span className="text-[10px] font-bold text-white">{pick.stars?.toFixed(1) || '5.0'}</span>
            </div>
            <div className="flex gap-3 text-white">
              <MessageCircle size={16} className="hover:text-[#D4FF33] transition-colors" />
              <Share2 size={16} className="hover:text-[#D4FF33] transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}