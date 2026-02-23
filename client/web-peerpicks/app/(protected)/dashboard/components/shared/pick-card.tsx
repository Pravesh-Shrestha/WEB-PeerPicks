"use client";

import React, { useEffect, useState, useTransition } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "@/lib/utils";
import {
  handleVote,
  handleDeletePick,
  handleToggleSave,
  updatePick, // Ensure this exists in your pick-action.ts
} from "@/lib/actions/pick-action";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

  // --- IDENTITY & TIME RESOLUTION ---
  const currentId = currentUser?._id || currentUser?.id;
  const authorId = pick.user?._id || pick.user?.id || pick.user;
  const isAuthor =
    currentId && authorId && currentId.toString() === authorId.toString();

  // Protocol [2026-02-23]: Format creation date
  const timestamp = pick.createdAt
    ? formatDistanceToNow(new Date(pick.createdAt), {
        addSuffix: true,
      }).toUpperCase()
    : "SIGNAL_ESTABLISHED";

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(pick.description);
  const [voteStatus, setVoteStatus] = useState<"up" | null>(
    pick.hasUpvoted ? "up" : null,
  );
  const [voteCount, setVoteCount] = useState(pick.upvoteCount || 0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited || false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync states when pick data refreshes
  useEffect(() => {
    if (pick.hasUpvoted !== undefined) {
      setVoteStatus(pick.hasUpvoted ? "up" : null);
    }
    if (pick.upvoteCount !== undefined) {
      setVoteCount(pick.upvoteCount);
    }
  }, [pick.hasUpvoted, pick.upvoteCount]);

  useEffect(() => {
    if (!isPending) {
      setIsFavorited(initialIsFavorited || false);
    }
  }, [initialIsFavorited, isPending]);

  // --- HELPERS ---
  const authorName = pick.user?.fullName || pick.user?.name || "Anonymous User";
  const authorAvatar = getMediaUrl(pick.user?.profilePicture, "profilePicture");
  const mediaFiles = pick.mediaUrls || [];

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % mediaFiles.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length,
    );
  };

  // --- ACTIONS ---
  const onVoteClick = async () => {
    if (!currentId)
      return toast.error("AUTH_REQUIRED", { description: "Login to vote." });

    const isUpvoted = voteStatus === "up";
    // Optimistic Update
    setVoteStatus(isUpvoted ? null : "up");
    setVoteCount((prev: number) => (isUpvoted ? prev - 1 : prev + 1));

    try {
      const res = await handleVote(pick._id);
      if (res?.data?.upvoteCount !== undefined) {
        setVoteCount(res.data.upvoteCount);
      }
    } catch (error) {
      setVoteStatus(isUpvoted ? "up" : null);
      setVoteCount((prev: number) => (isUpvoted ? prev + 1 : prev - 1));
      toast.error("SIGNAL INTERRUPTED", { description: "VOTE FAILED TO SYNC" });
    }
  };

  const onToggleSave = async () => {
    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);

    try {
      const result = await handleToggleSave(pick._id);

      if (result.success) {
        if (result.isFavorited === false && onDeleteSuccess) {
          onDeleteSuccess();
        } else if (result.isFavorited === true && onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        setIsFavorited(!newFavoritedState);
        toast.error("SYNC_ERROR", { description: "VAULT_CONNECTION_FAILED" });
      }
    } catch (error) {
      setIsFavorited(!newFavoritedState);
      toast.error("VAULT_FAILURE");
    }
  };

  const onUpdatePick = async () => {
    // 1. Validate: Block empty signals or redundant updates
    const cleanContent = editContent?.trim();
    if (!cleanContent || cleanContent === pick.description) {
      setIsEditing(false);
      setEditContent(pick.description); // Reset local state just in case
      return;
    }

    try {
      // 2. Transmit: Execute the modification protocol
      const result: any = await updatePick(pick._id, {
        description: cleanContent,
      });

      // 3. Resolve: Handle server confirmation
      // Checking for success in result or result.data depending on your interceptor setup
      if (result?.success || result?.data?.success) {
        toast.success("SIGNAL_MODIFIED", {
          description: "SYSTEM_DESCRIPTION_UPDATED",
        });

        // 4. Persistence: Update local reference and exit mode
        pick.description = cleanContent;
        setIsEditing(false);

        // Refresh the server-side state to keep the feed synced
        router.refresh();
      } else {
        throw new Error("SERVER_REJECTION");
      }
    } catch (error) {
      // 5. Rollback: Maintain signal stability on failure
      toast.error("UPDATE_FAILED", {
        description: "SIGNAL_STABILITY_ERROR - REVERTING_CHANGES",
      });
      setEditContent(pick.description);
      setIsEditing(false);
    }
  };

  const onDeleteClick = async () => {
    // Protocol Compliance [2026-02-01]
    const confirmed = confirm(
      "CONFIRM PROTOCOL: Delete this pick from the system?",
    );
    if (confirmed) {
      try {
        const result = await handleDeletePick(pick._id);
        if (result.success) {
          toast.success("SIGNAL DELETED", {
            description: "DATA REMOVED FROM FEED",
          });
          if (onDeleteSuccess) onDeleteSuccess();
          router.refresh();
        }
      } catch (error: any) {
        toast.error("DELETE FAILED");
      }
    }
  };

  const onShareClick = () => {
    const url = `${window.location.origin}/dashboard/picks/${pick._id}`;
    navigator.clipboard.writeText(url);
    toast.info("LINK COPIED");
  };

  const renderMedia = (url: string, className: string, autoPlay = true) => {
    const isVideo = url.match(/\.(mp4|webm|mov)$/i);
    const fullUrl = getMediaUrl(url, "pick");
    if (isVideo) {
      return (
        <video
          src={fullUrl}
          autoPlay={autoPlay}
          muted={isMuted}
          loop
          playsInline
          className={className}
        />
      );
    }
    return <img src={fullUrl} className={className} alt="Pick content" />;
  };

  return (
    <>
      <div className="relative w-full max-w-4xl mx-auto mb-20 group/card">
        <div className="w-full bg-[#09090B] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:border-[#D4FF33]/20">
          {/* HEADER */}
          <div className="p-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full border border-white/10 overflow-hidden bg-zinc-900">
                <img
                  src={authorAvatar}
                  className="w-full h-full object-cover"
                  alt={authorName}
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-bold text-white">{authorName}</h4>
                  {/* Timestamp Protocol */}
                  <span className="text-[10px] font-mono text-zinc-600 tracking-tighter uppercase">
                    {pick.createdAt
                      ? formatDistanceToNow(new Date(pick.createdAt), {
                          addSuffix: true,
                        })
                      : "SIGNAL_LIVE"}
                  </span>
                </div>
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pick.locationName || pick.placeDetails?.name || "")}`}
                  target="_blank"
                  className="flex items-center gap-2 mt-1 text-zinc-500 hover:text-[#D4FF33] transition-colors group"
                >
                  <MapPin size={14} className="group-hover:animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {pick.locationName ||
                      pick.placeDetails?.name ||
                      "Unknown Sector"}
                    {pick.alias &&
                      pick.alias !==
                        (pick.locationName || pick.placeDetails?.name) && (
                        <span className="ml-1 text-[#D4FF33]/70">
                          ({pick.alias})
                        </span>
                      )}
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAuthor && (
                <div className="flex items-center gap-2">
                  {/* Edit Toggle Button */}
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditContent(pick.description);
                    }}
                    className={`p-3 rounded-xl border transition-all ${isEditing ? "bg-[#D4FF33] border-[#D4FF33] text-black" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"}`}
                  >
                    {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                  </button>
                  <button
                    onClick={onDeleteClick}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              )}
              <div className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-2">
                <Star size={18} className="fill-[#D4FF33] text-[#D4FF33]" />
                <span className="text-lg font-black text-white">
                  {pick.stars?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>
          </div>

          {/* MEDIA SLIDER */}
          <div className="px-8 relative group/media">
            <div
              className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden bg-black shadow-inner cursor-pointer"
              onClick={() => setIsFullscreen(true)}
            >
              {mediaFiles.length > 0 ? (
                renderMedia(
                  mediaFiles[currentIndex],
                  "w-full h-full object-cover",
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 uppercase font-black text-xs tracking-widest">
                  No Media Payload
                </div>
              )}

              {mediaFiles.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-[#D4FF33] hover:text-black transition-all z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-[#D4FF33] hover:text-black transition-all z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              <button className="absolute top-6 right-6 p-4 bg-black/50 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover/media:opacity-100 transition-opacity">
                <Maximize2 size={20} />
              </button>
            </div>
          </div>

          {/* CONTENT & ACTIONS */}
          <div className="p-12">
            {isEditing ? (
              <div className="mb-12 space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white/5 border border-[#D4FF33]/30 rounded-[2rem] p-8 text-xl text-white outline-none focus:border-[#D4FF33] transition-all min-h-[150px] italic font-medium"
                  autoFocus
                />
                <button
                  onClick={onUpdatePick}
                  className="flex items-center gap-2 px-8 py-4 bg-[#D4FF33] text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  <Check size={16} strokeWidth={3} /> Commit_Changes
                </button>
              </div>
            ) : (
              <p className="text-zinc-300 text-xl font-medium leading-relaxed mb-12 italic">
                "{pick.description}"
              </p>
            )}

            <div className="flex items-center justify-between pt-10 border-t border-white/5">
              <button
                onClick={onVoteClick}
                className={`flex items-center gap-4 px-8 py-4 rounded-3xl border transition-all active:scale-90 ${
                  voteStatus === "up"
                    ? "bg-[#D4FF33] border-[#D4FF33] text-black shadow-[0_0_20px_rgba(212,255,51,0.2)]"
                    : "bg-white/5 border-white/10 text-white hover:border-white/30"
                }`}
              >
                <motion.div
                  animate={voteStatus === "up" ? { y: [0, -4, 0] } : { y: 0 }}
                  transition={{
                    repeat: voteStatus === "up" ? Infinity : 0,
                    duration: 2,
                  }}
                >
                  <ChevronUp size={28} strokeWidth={3} />
                </motion.div>
                <span className="text-lg font-black">{voteCount}</span>
              </button>

              <div className="flex gap-10">
                <button
                  onClick={onToggleSave}
                  className={`flex flex-col items-center gap-2 transition-all group/vault ${isFavorited ? "text-pink-500" : "text-zinc-500 hover:text-white"}`}
                >
                  <motion.div
                    animate={
                      isFavorited
                        ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.4, ease: "backOut" }}
                    className={`p-5 rounded-3xl bg-white/5 border border-white/10 transition-all ${isFavorited ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]" : "group-hover/vault:border-white/30"}`}
                  >
                    <Heart
                      size={28}
                      className={`transition-colors duration-300 ${isFavorited ? "fill-pink-500" : "fill-transparent"}`}
                    />
                  </motion.div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {isFavorited ? "Stored" : "Vault"}
                  </span>
                </button>

                <button
                  onClick={() => router.push(`/dashboard/picks/${pick._id}`)}
                  className="flex flex-col items-center gap-2 text-zinc-500 hover:text-[#D4FF33] group/signal"
                >
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/10 group-hover/signal:border-[#D4FF33]/40 transition-all">
                    <MessageCircle size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {pick.commentCount || 0} Signals
                  </span>
                </button>

                <button
                  onClick={onShareClick}
                  className="flex flex-col items-center gap-2 text-zinc-500 hover:text-white group/share"
                >
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/10 group-hover/share:border-white/40 transition-all">
                    <Share2 size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    Share
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/98 flex items-center justify-center"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-10 right-10 text-white p-4 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <X size={32} />
            </button>
            <div className="w-full h-full flex items-center justify-center p-4">
              {renderMedia(
                mediaFiles[currentIndex],
                "max-w-full max-h-full object-contain rounded-xl shadow-2xl",
                true,
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
