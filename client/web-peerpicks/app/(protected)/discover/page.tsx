"use client";

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Loader2, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { getDiscoveryFeed } from '@/lib/actions/pick-actions'; 

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [picks, setPicks] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const categories = ['ALL', 'RESTAURANT', 'CAFE', 'HOTEL', 'PARK', 'LIBRARY', 'OTHERS'];

  useEffect(() => {
    async function loadPicks() {
      try {
        setIsLoading(true);
        const data = await getDiscoveryFeed('for-you'); 
        
        let fetchedPicks = [];
        if (Array.isArray(data)) fetchedPicks = data;
        else if (data?.picks) fetchedPicks = data.picks;
        else if (data?.data) fetchedPicks = data.data;

        // Shuffle logic for the "Discovery" feel
        const shuffled = [...fetchedPicks].sort(() => Math.random() - 0.5);
        setPicks(shuffled);
      } catch (error) {
        console.error("Failed to load discover feed:", error);
        setPicks([]); 
      } finally {
        setIsLoading(false);
      }
    }
    loadPicks();
  }, []);

  const filteredPicks = (Array.isArray(picks) ? picks : []).filter(pick => {
    const alias = pick.placeInfo?.alias || pick.alias || "";
    const description = pick.description || "";
    const category = pick.placeInfo?.category || pick.category || "OTHERS";

    const matchesSearch = 
      alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'ALL' || category.toUpperCase() === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1600px] mx-auto pt-8">
      {/* ─── SEARCH & FILTERS ─── */}
      <div className="mb-10 space-y-6 px-4">
        <div className="flex gap-4 items-center max-w-2xl mx-auto">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4FF33] transition-colors" size={18} />
            <input
              type="text"
              placeholder="SEARCH VISUAL FEED..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-full py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-[#D4FF33]/40 transition-all placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto justify-center pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-[#D4FF33] text-black border-[#D4FF33] shadow-[0_0_15px_rgba(212,255,51,0.2)]' 
                  : 'bg-white/5 text-zinc-500 border-transparent hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MASONRY VISUAL GRID ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-[#D4FF33]" size={32} />
        </div>
      ) : (
        <div className="px-4">
          {filteredPicks.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 mb-12">
              {filteredPicks.map((pick) => (
                <VisualPickCard key={pick._id} pick={pick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 opacity-20 italic font-black uppercase tracking-[0.5em] text-xs">
              No Signals Found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PINTEREST/INSTAGRAM STYLE CARD ───
function VisualPickCard({ pick }: { pick: any }) {
  const mediaUrl = pick.mediaUrls?.[0] || pick.images?.[0];
  const isVideo = mediaUrl?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="relative group break-inside-avoid rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/5">
      {/* Media Content */}
      {isVideo ? (
        <video 
          src={mediaUrl} 
          muted 
          loop 
          autoPlay 
          playsInline
          className="w-full h-auto object-cover"
        />
      ) : (
        <img 
          src={mediaUrl || '/placeholder-place.jpg'} 
          alt={pick.alias} 
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}

      {/* Instagram-style Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4">
        <div className="flex justify-end">
          <span className="bg-[#D4FF33] text-black text-[8px] font-black px-2 py-1 rounded-full uppercase">
            {pick.placeInfo?.category || pick.category || 'OTHERS'}
          </span>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-white font-black uppercase text-xs tracking-tight truncate">
            {pick.placeInfo?.alias || pick.alias}
          </h3>
          <div className="flex items-center gap-3 text-white/70">
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <Heart size={12} className="fill-white" /> {pick.upvoteCount || 0}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <MessageCircle size={12} className="fill-white" /> {pick.commentCount || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}