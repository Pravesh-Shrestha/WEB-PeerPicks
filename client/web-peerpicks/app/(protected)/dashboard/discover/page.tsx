"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Loader2, MessageCircle, Star, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
      {/* HEADER: Subtly elevated search and filter */}
      <div className="sticky top-0 z-50 bg-[#020203]/80 backdrop-blur-xl border-b border-white/[0.05] py-8">
        <div className="max-w-[1400px] mx-auto space-y-8 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <h1 className="text-2xl font-black uppercase tracking-[0.4em]">Discover</h1>
            <div className="relative w-full max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#D4FF33]" size={18} />
              <input
                type="text"
                placeholder="Search signals, vibes, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-white/[0.08] rounded-full py-4 pl-16 pr-8 text-sm focus:outline-none focus:border-[#D4FF33]/40 transition-all text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  activeCategory === cat.id ? 'bg-white text-black border-white' : 'bg-[#09090B] text-zinc-500 border-white/5 hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* THE MASONRY GRID */}
      <div className="max-w-[1400px] mx-auto py-10">
        {isLoading ? (
          <div className="flex justify-center py-40"><Loader2 className="animate-spin text-zinc-800" size={32} /></div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-8 space-y-8">
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
    <div onClick={() => router.push(`/dashboard/picks/${pick._id}`)} className="break-inside-avoid group cursor-pointer">
      {/* Media Block: Uses #09090B to create a soft surface lift */}
      <div className="relative rounded-[2rem] overflow-hidden bg-[#09090B] border border-white/[0.05] transition-all duration-500 group-hover:border-[#D4FF33]/30">
        {isVideo ? (
          <video src={mediaUrl} muted loop autoPlay playsInline className="w-full" />
        ) : (
          <img src={mediaUrl} alt="" className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110" />
        )}
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6">
          <div className="flex justify-end">
            <button className="bg-[#D4FF33] text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-tighter hover:scale-105 transition-transform">Save</button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <Star size={12} className="fill-[#D4FF33] text-[#D4FF33]" />
              <span className="text-[11px] font-bold">{pick.stars?.toFixed(1) || '5.0'}</span>
            </div>
            <div className="flex gap-4 text-white/80"><MessageCircle size={18} /><Share2 size={18} /></div>
          </div>
        </div>
      </div>
      
      {/* Metadata Section: Grounds the card in the UI */}
      <div className="mt-4 px-3">
        <h3 className="text-[14px] font-bold text-zinc-100 truncate group-hover:text-[#D4FF33] transition-colors">{pick.alias || pick.locationName}</h3>
        <div className="flex items-center gap-2.5 mt-2">
          <img src={getMediaUrl(pick.user?.profilePicture, 'profilePicture')} className="w-6 h-6 rounded-full ring-1 ring-white/10" alt="" />
          <span className="text-[11px] font-medium text-zinc-500 truncate lowercase">@{pick.user?.fullName || 'anonymous'}</span>
        </div>
      </div>
    </div>
  );
}