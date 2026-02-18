"use client";

import React, { useState } from 'react';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Star, 
  MoreHorizontal, 
  Trash2,
  MapPin,
  ExternalLink,
  X
} from 'lucide-react';
import MediaSlider from './media-slider';
import { deletePick } from "@/lib/actions/pick-actions";

export function PickCard({ pick, onUpdate }: any) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const user = pick.user || {};
  const score = (pick.upvotes?.length || 0) - (pick.downvotes?.length || 0) + (vote === 'up' ? 1 : vote === 'down' ? -1 : 0);
  
  const resolve = (path: string) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost:3000${path.startsWith('/') ? path : `/${path}`}`;
  };

  const handleRedirect = () => {
    const targetUrl = pick.placeInfo?.link || pick.place;
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this pick?")) {
      await deletePick(pick._id);
      if (onUpdate) onUpdate();
    }
  };

  const avatarSrc = resolve(user?.profilePicture);
  const stars = pick.reviewInfo?.stars || 5;

  return (
    <>
      <div
        className="pick-card group relative w-full max-w-[850px] mx-auto mb-6 transition-transform duration-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Ambient glow */}
        <div className="absolute -inset-px rounded-[40px] bg-gradient-to-br from-[#D4FF33]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none" />

        <div className="relative bg-[#0C0C0E] border border-white/[0.07] rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
          
          {/* HEADER */}
          <div className="relative px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-lg font-black text-[#D4FF33]">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[15px] font-bold text-white tracking-tight leading-none">
                  {user?.fullName || 'User'}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin size={10} className="text-[#D4FF33]" />
                  <span className="text-[10px] text-[#D4FF33] font-black tracking-[0.2em] uppercase">
                    {pick.placeInfo?.alias || pick.alias || 'Location'}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)} 
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
              >
                <MoreHorizontal size={20} />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-[#141416] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <button onClick={handleDelete} className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/10 text-[11px] font-black uppercase tracking-widest transition-colors">
                    <Trash2 size={14} /> Delete Pick
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="px-9 pb-6">
            <p className="text-[17px] text-zinc-200 leading-relaxed font-medium">
              {pick.description}
            </p>
          </div>

          {/* MEDIA: SQUARE CONTAINER */}
          <div className="px-8">
            <div 
              onClick={() => setIsFullscreen(true)}
              className="relative w-full aspect-square rounded-[32px] overflow-hidden bg-zinc-950 border border-white/5 cursor-zoom-in group/media"
            >
              <MediaSlider urls={pick.mediaUrls || []} />
              
              {/* Expand Hint Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                 <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] bg-black/60 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                   Click to Expand
                 </span>
              </div>

              <div className="absolute top-5 right-5 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                <Star size={12} className="text-[#D4FF33]" fill="currentColor" />
                <span className="text-sm font-black text-white">{stars}.0</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-8 py-8 flex items-center gap-4">
            <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-[24px] p-1.5 shrink-0">
              <button onClick={() => setVote(vote === 'up' ? null : 'up')} className={`p-3.5 rounded-[18px] transition-all duration-300 ${vote === 'up' ? 'bg-[#D4FF33] text-black shadow-[0_0_20px_rgba(212,255,51,0.4)]' : 'text-zinc-500 hover:text-white'}`}>
                <ArrowBigUp size={24} fill={vote === 'up' ? 'currentColor' : 'none'} />
              </button>
              <span className={`px-5 text-lg font-black min-w-[50px] text-center tabular-nums ${vote === 'up' ? 'text-[#D4FF33]' : 'text-white'}`}>{score}</span>
              <button onClick={() => setVote(vote === 'down' ? null : 'down')} className={`p-3.5 rounded-[18px] transition-all duration-300 ${vote === 'down' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-zinc-500 hover:text-white'}`}>
                <ArrowBigDown size={24} fill={vote === 'down' ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button className="flex-1 h-[68px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-[24px] flex items-center justify-center gap-3 text-zinc-400 hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[11px]">
              <MessageSquare size={18} /> Discuss
            </button>

            <button onClick={handleRedirect} className="w-[68px] h-[68px] bg-white/[0.03] hover:bg-[#D4FF33]/10 border border-white/[0.08] rounded-[24px] flex items-center justify-center text-zinc-500 hover:text-[#D4FF33] transition-all">
              <ExternalLink size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* FULLSCREEN VIEW */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
          <button 
            onClick={() => setIsFullscreen(false)}
            className="absolute top-8 right-8 w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all z-[110]"
          >
            <X size={32} />
          </button>
          <div className="w-full h-full max-w-6xl flex items-center justify-center">
            {/* Reusing slider but at full scale */}
            <MediaSlider urls={pick.mediaUrls || []} />
          </div>
        </div>
      )}
    </>
  );
}