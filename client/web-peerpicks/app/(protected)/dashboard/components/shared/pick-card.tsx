"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Star,
  Share2,
  MapPin,
  Maximize2,
  X,
  Heart,
  Trash2,
  Edit3,
  Check,
  Volume2,
  VolumeX,
  Copy,
  MoreVertical,
  Play,
  Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "@/lib/utils";
import {
  handleVote,
  handleDeletePick,
  handleToggleSave,
  updatePick,
} from "@/lib/actions/pick-action";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PickCardProps {
  pick: any;
  currentUserId?: string;
  onDeleteSuccess?: () => void;
  onSaveSuccess?: () => void;
  onUpdateSuccess?: () => void;
  initialIsFavorited?: boolean;
}

export const PickCard = ({
  pick,
  initialIsFavorited,
  onDeleteSuccess,
  onSaveSuccess,
  onUpdateSuccess,
}: PickCardProps) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- IDENTITY & DATA ---
  const currentId = currentUser?._id || currentUser?.id;
  const authorId = pick.user?._id || pick.user?.id || pick.user;
  const isAuthor = currentId && authorId && currentId.toString() === authorId.toString();

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(pick.description);
  const [voteStatus, setVoteStatus] = useState<"up" | null>(pick.hasUpvoted ? "up" : null);
  const [voteCount, setVoteCount] = useState(pick.upvoteCount || 0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited || false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTray, setShowTray] = useState(false);

  useEffect(() => {
    if (pick.hasUpvoted !== undefined) setVoteStatus(pick.hasUpvoted ? "up" : null);
    if (pick.upvoteCount !== undefined) setVoteCount(pick.upvoteCount);
  }, [pick.hasUpvoted, pick.upvoteCount]);

  const authorName = pick.user?.fullName || pick.user?.name || "Anonymous User";
  const authorAvatar = getMediaUrl(pick.user?.profilePicture, "profilePicture");
  const mediaFiles = pick.mediaUrls || [];

  const hasValidName = !!(pick.locationName || pick.placeDetails?.name);
  const coords = pick.location?.coordinates || pick.placeDetails?.geometry?.location;

  const handleLocationClick = (e: React.MouseEvent) => {
    if (!hasValidName && coords) {
      e.preventDefault();
      const coordStr = `${coords.lat || coords[1]}, ${coords.lng || coords[0]}`;
      navigator.clipboard.writeText(coordStr);
      toast.success("COORDINATES_COPIED", { description: coordStr });
    }
  };

  const onShareClick = () => {
    const url = `${window.location.origin}/dashboard/picks/${pick._id}`;
    navigator.clipboard.writeText(url);
    toast.info("LINK_COPIED", { description: "Signal shared to clipboard." });
  };

  const onUpdatePick = async () => {
    const cleanContent = editContent?.trim();
    if (!cleanContent || cleanContent === pick.description) {
      setIsEditing(false);
      return;
    }
    try {
      const result: any = await updatePick(pick._id, { description: cleanContent });
      if (result?.success || result?.data?.success) {
        toast.success("SIGNAL_MODIFIED");
        pick.description = cleanContent;
        setIsEditing(false);
        if (onUpdateSuccess) onUpdateSuccess();
        router.refresh();
      }
    } catch (error) {
      toast.error("UPDATE_FAILED");
      setEditContent(pick.description);
      setIsEditing(false);
    }
  };

  const onVoteClick = async () => {
    if (!currentId) return toast.error("AUTH_REQUIRED");
    const isUpvoted = voteStatus === "up";
    setVoteStatus(isUpvoted ? null : "up");
    setVoteCount((prev: number) => (isUpvoted ? prev - 1 : prev + 1));
    try {
      const res = await handleVote(pick._id);
      if (res?.data?.upvoteCount !== undefined) setVoteCount(res.data.upvoteCount);
    } catch (error) {
      setVoteStatus(isUpvoted ? "up" : null);
      setVoteCount((prev: number) => (isUpvoted ? prev + 1 : prev - 1));
    }
  };

  const onToggleSave = async () => {
    setIsFavorited(!isFavorited);
    try {
      const result = await handleToggleSave(pick._id);
      if (result.success) {
        if (!result.isFavorited && onDeleteSuccess) onDeleteSuccess();
        if (result.isFavorited && onSaveSuccess) onSaveSuccess();
      }
    } catch (error) {
      setIsFavorited(!isFavorited);
    }
  };

  const onDeleteClick = async () => {
    if (confirm("CONFIRM PROTOCOL: Delete this pick?")) {
      try {
        const result = await handleDeletePick(pick._id);
        if (result.success) {
          toast.success("SIGNAL_DELETED");
          if (onDeleteSuccess) onDeleteSuccess();
          router.refresh();
        }
      } catch (error) { toast.error("DELETE_FAILED"); }
    }
  };

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const renderMedia = (url: string, className: string, isLightbox = false) => {
    const isVideo = url.match(/\.(mp4|webm|mov)$/i);
    const fullUrl = getMediaUrl(url, "pick");
    
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {/* Dynamic Blur Background to cover gaps */}
        <div 
          className="absolute inset-0 scale-150 blur-3xl opacity-40 bg-center bg-cover pointer-events-none"
          style={{ backgroundImage: isVideo ? 'none' : `url(${fullUrl})`, backgroundColor: '#000' }}
        />
        
        {isVideo ? (
          <div className="relative w-full h-full flex items-center justify-center z-10">
            <video 
              ref={isLightbox ? videoRef : null}
              src={fullUrl} 
              autoPlay 
              // Card video is ALWAYS muted if lightbox is open to prevent double audio
              muted={isLightbox ? isMuted : true} 
              loop 
              playsInline 
              className={`${className} ${isLightbox ? '' : 'pointer-events-none'}`} 
            />
            
            {/* Playback Controls Container - ONLY VISIBLE IN LIGHTBOX */}
            {isLightbox && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 z-20 pointer-events-auto">
                 <button 
                   onClick={toggleVideoPlayback}
                   className="text-white hover:text-[#D4FF33] transition-colors"
                 >
                   {isPlaying ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor"/>}
                 </button>
                 <div className="w-[1px] h-6 bg-white/20" />
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                   className="text-white hover:text-[#D4FF33] transition-colors"
                 >
                   {isMuted ? <VolumeX size={24}/> : <Volume2 size={24}/>}
                 </button>
              </div>
            )}
          </div>
        ) : (
          <img src={fullUrl} className={`${className} relative z-10`} alt="" />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="relative w-full mb-6 group/card">
        <div className="w-full bg-[#121214] border border-white/[0.08] rounded-[1.5rem] overflow-hidden shadow-xl transition-all duration-300 hover:border-[#D4FF33]/30">
          
          {/* HEADER */}
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01] relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden bg-zinc-900 shadow-inner">
                <img src={authorAvatar} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{authorName}</h4>
                <a
                  href={hasValidName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pick.locationName || pick.placeDetails?.name || "")}` : "#"}
                  target={hasValidName ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  onClick={handleLocationClick}
                  className="flex items-center gap-1.5 mt-0.5 text-zinc-400 hover:text-[#D4FF33] transition-colors group/loc"
                >
                  <MapPin size={10} className="text-[#D4FF33]" />
                  <span className="text-[10px] font-mono uppercase tracking-tighter truncate max-w-[140px]">
                    {hasValidName ? (pick.locationName || pick.placeDetails?.name) : "Copy_Coordinates"}
                  </span>
                  {!hasValidName && coords && <Copy size={8} className="ml-1 opacity-50" />}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-[#D4FF33]/10 border border-[#D4FF33]/20 px-2 py-1 rounded-lg flex items-center gap-1">
                <Star size={12} className="fill-[#D4FF33] text-[#D4FF33]" />
                <span className="text-xs font-black text-[#D4FF33]">{pick.stars?.toFixed(1) || "0.0"}</span>
              </div>
              
              {isAuthor && (
                <div className="relative ml-1">
                  <button 
                    onClick={() => setShowTray(!showTray)}
                    className={`p-2 rounded-lg transition-colors ${showTray ? "text-[#D4FF33] bg-white/5" : "text-zinc-500 hover:text-white"}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {showTray && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTray(false)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-36 bg-[#1A1A1C] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden p-1"
                        >
                          <button 
                            onClick={() => { setIsEditing(true); setShowTray(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-zinc-400 hover:text-[#D4FF33] hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => { onDeleteClick(); setShowTray(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-red-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all uppercase tracking-widest"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* CARD MEDIA BOX */}
          <div 
            className="relative aspect-square w-full overflow-hidden bg-black cursor-zoom-in group/media flex items-center justify-center border-b border-white/5"
            onClick={() => setIsFullscreen(true)}
          >
            {/* If fullscreen is on, we hide the card media to prevent double playback/audio */}
            {!isFullscreen && mediaFiles.length > 0 ? (
              renderMedia(mediaFiles[currentIndex], "w-full h-full object-contain")
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                {isFullscreen ? "Viewing_Main_Signal" : "Media_Offline"}
              </div>
            )}
            
            {!isFullscreen && mediaFiles.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-none z-10">
                <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(p => (p - 1 + mediaFiles.length) % mediaFiles.length); }} className="p-2 bg-black/60 rounded-full text-white hover:bg-[#D4FF33] hover:text-black pointer-events-auto"><ChevronLeft size={20} /></button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(p => (p + 1) % mediaFiles.length); }} className="p-2 bg-black/60 rounded-full text-white hover:bg-[#D4FF33] hover:text-black pointer-events-auto"><ChevronRight size={20} /></button>
              </div>
            )}
            {!isFullscreen && (
              <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-lg text-white opacity-0 group-hover/media:opacity-100 transition-opacity z-10">
                <Maximize2 size={16} />
              </div>
            )}
          </div>

          {/* FOOTER AREA */}
          <div className="p-5">
            {isEditing ? (
              <div className="space-y-3 mb-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white/5 border border-[#D4FF33]/30 rounded-xl p-4 text-sm text-white outline-none focus:border-[#D4FF33] transition-all min-h-[100px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={onUpdatePick} className="flex-1 py-2 bg-[#D4FF33] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                    <Check size={14} /> Commit_Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white/5 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                {pick.description}
              </p>
            )}

            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/5">
              <button onClick={onVoteClick} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${voteStatus === "up" ? "bg-[#D4FF33] border-[#D4FF33] text-black" : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"}`}>
                <ChevronUp size={18} strokeWidth={3} /><span className="text-xs font-bold font-mono">{voteCount}</span>
              </button>
              <button onClick={onToggleSave} className={`flex items-center justify-center py-2.5 rounded-xl border transition-all ${isFavorited ? "bg-pink-500/10 border-pink-500/20 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.1)]" : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"}`}>
                <Heart size={18} className={isFavorited ? "fill-pink-500" : ""} />
              </button>
              <button onClick={() => router.push(`/dashboard/picks/${pick._id}`)} className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-[#D4FF33] transition-all">
                <MessageCircle size={18} />
              </button>
              <button onClick={onShareClick} className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-[#D4FF33] transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TRUE FULLSCREEN LIGHTBOX */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            // Highest z-index to cover every UI element (Tabs, Navs, etc.)
            className="fixed inset-0 z-[999999] bg-black flex items-center justify-center w-screen h-screen overflow-hidden"
          >
            {/* Background Closer */}
            <div className="absolute inset-0 z-0 cursor-zoom-out" onClick={() => setIsFullscreen(false)} />
            
            {/* Close Button - Larger and more prominent */}
            <button 
              onClick={() => setIsFullscreen(false)} 
              className="absolute top-8 right-8 z-[1000001] text-white p-4 bg-black/50 backdrop-blur-xl border border-white/20 rounded-full hover:bg-red-600 transition-all pointer-events-auto shadow-2xl"
            >
              <X size={32} />
            </button>

            {/* Content Container - No padding, full width/height */}
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
              {mediaFiles.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(p => (p - 1 + mediaFiles.length) % mediaFiles.length); }} className="absolute left-6 z-[1000001] p-6 bg-white/5 hover:bg-white/10 rounded-full text-white pointer-events-auto backdrop-blur-md transition-all"><ChevronLeft size={48} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(p => (p + 1) % mediaFiles.length); }} className="absolute right-6 z-[1000001] p-6 bg-white/5 hover:bg-white/10 rounded-full text-white pointer-events-auto backdrop-blur-md transition-all"><ChevronRight size={48} /></button>
                </>
              )}
              
              <motion.div 
                initial={{ scale: 1.1, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center pointer-events-auto"
              >
                {/* true lightbox mode rendering */}
                {renderMedia(mediaFiles[currentIndex], "w-screen h-screen object-contain", true)}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};