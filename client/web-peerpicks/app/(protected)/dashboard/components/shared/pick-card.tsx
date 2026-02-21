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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "@/lib/utils";
import {
  handleVote,
  handleDeletePick,
  handleToggleSave,
} from "@/lib/actions/pick-action";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Added Sonner

interface PickCardProps {
  pick: any;
  currentUserId?: string;
  onDeleteSuccess?: () => void;
  onSaveSuccess?: () => void;
  initialIsFavorited?: boolean;
}

export const PickCard = ({
  pick,
  initialIsFavorited,
  onDeleteSuccess,
  onSaveSuccess, // Destructured correctly
}: PickCardProps) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [voteStatus, setVoteStatus] = useState<"up" | null>(
    pick.hasUpvoted ? "up" : null,
  );
  const [voteCount, setVoteCount] = useState(pick.upvoteCount || 0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited || false);

  useEffect(() => {
    if (!isPending) {
      setIsFavorited(initialIsFavorited || false);
    }
  }, [initialIsFavorited, isPending]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isAuthor =
    currentUser?.id === pick.user?._id || currentUser?._id === pick.user?._id;
  const authorName = pick.user?.fullName || pick.user?.name || "Anonymous User";
  const authorAvatar = getMediaUrl(pick.user?.profilePicture, "profilePicture");
  const mediaFiles = pick.mediaUrls || [];
  const locationDisplay = pick.locationName || pick.placeDetails?.name || "Unknown Sector";
  const aliasDisplay = pick.locationAlias || pick.alias || "";

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

  const onVoteClick = async () => {
    setVoteStatus(voteStatus === "up" ? null : "up");
    setVoteCount((prev: number) => (voteStatus === "up" ? prev - 1 : prev + 1));
    await handleVote(pick._id);
  };

  const onFavoriteClick = async () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await handleToggleSave(pick._id);

        if (result && result.success) {
          if (result.isFavorited) {
            setIsFavorited(true);

            // Trigger global notification in FeedContent
            if (onSaveSuccess) onSaveSuccess();

            // Wait 1.4s for the top notification to be read before removing card
            setTimeout(() => {
              if (onDeleteSuccess) onDeleteSuccess();
            }, 1400);
          } else {
            setIsFavorited(false);
            // Instant removal if unsaving
            if (onDeleteSuccess) onDeleteSuccess();
          }
        }
      } catch (error: any) {
        console.error("Favorite error:", error);
        if (error.response?.status === 429) {
          toast.error("SYSTEM BUSY", { description: "TOO MANY REQUESTS" });
        }
      }
    });
  };

  // 2. DELETE LOGIC
  const onDeleteClick = async () => {
    // Protocol Compliance: Terminology "Delete" [cite: 2026-02-01]
    const confirmed = confirm(
      "CONFIRM PROTOCOL: Delete this pick from the system?",
    );

    if (confirmed) {
      try {
        const result = await handleDeletePick(pick._id);

        if (result.success) {
          toast.success("PICK DELETED", {
            description: "DATA REMOVED FROM GLOBAL FEED",
          });

          // Remove from local feed state immediately
          if (onDeleteSuccess) onDeleteSuccess();

          router.refresh();
        }
      } catch (error: any) {
        toast.error("DELETE FAILED", {
          description: error.message || "INTERNAL SYSTEM ERROR",
        });
      }
    }
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
    return <img src={fullUrl} className={className} alt="Post media" />;
  };
  // 1. SHARE LOGIC
  const onShareClick = () => {
    // Generate URL based on pick ID
    const url = `${window.location.origin}/picks/${pick._id}`;

    // Copy to clipboard
    navigator.clipboard.writeText(url);

    // Design Protocol Toast
    toast.info("LINK COPIED", {
      description: "SIGNAL URL SAVED TO CLIPBOARD",
      icon: <Share2 size={14} className="text-[#D4FF33]" />,
    });
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
                  alt=""
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{authorName}</h4>
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    pick.locationName ||
                      pick.placeDetails?.name ||
                      pick.alias ||
                      "",
                  )}`}
                  target="_blank"
                  className="flex items-center gap-2 mt-1 text-zinc-500 hover:text-[#D4FF33] transition-colors group"
                >
                  <MapPin size={14} className="group-hover:animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {pick.locationName ||
                      pick.placeDetails?.name ||
                      (typeof pick.place === "string" ? pick.place : "") ||
                      "Location:"}

                    {/* Display Alias if it exists and is different from the name */}
                    {pick.alias && pick.alias !== pick.locationName && (
                      <span className="ml-1 text-[#D4FF33]/70">
                        ({pick.alias})
                      </span>
                    )}
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* DELETE BUTTON - Protocol: Terminology "Delete" [2026-02-01] */}
              {isAuthor && (
                <button
                  onClick={onDeleteClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
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
            <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden bg-black shadow-inner">
              {renderMedia(
                mediaFiles[currentIndex],
                "w-full h-full object-cover",
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
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {mediaFiles.map((_: any, i: number) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-[#D4FF33]" : "w-1.5 bg-white/30"}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute top-6 right-6 p-4 bg-black/50 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover/media:opacity-100 transition-opacity"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>

          {/* BOTTOM CONTENT */}
          <div className="p-12">
            <p className="text-zinc-300 text-xl font-medium leading-relaxed mb-12">
              {pick.description}
            </p>

            <div className="flex items-center justify-between pt-10 border-t border-white/5">
              <button
                onClick={onVoteClick}
                className={`flex items-center gap-4 px-8 py-4 rounded-3xl border transition-all ${
                  voteStatus === "up"
                    ? "bg-[#D4FF33] border-[#D4FF33] text-black shadow-lg scale-105"
                    : "bg-white/5 border-white/10 text-white hover:border-white/20"
                }`}
              >
                <ChevronUp size={28} strokeWidth={3} />
                <span className="text-lg font-black">{voteCount} Votes</span>
              </button>

              <div className="flex gap-10">
                {/* SAVE BUTTON */}
                <button
                  onClick={onFavoriteClick}
                  disabled={isPending}
                  className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${isFavorited ? "text-pink-500" : "text-zinc-500 hover:text-white"}`}
                >
                  <div
                    className={`p-5 rounded-3xl bg-white/5 border border-white/10 transition-all ${isFavorited ? "bg-pink-500/10 border-pink-500/50" : "hover:border-white/30"}`}
                  >
                    <Heart
                      size={28}
                      className={
                        isFavorited
                          ? "fill-pink-500 text-pink-500"
                          : "text-zinc-500"
                      }
                    />
                  </div>
                  <span className="text-xs font-bold uppercase">
                    {isFavorited ? "Saved" : "Save"}
                  </span>
                </button>

                {/* COMMENTS BUTTON */}
                <button className="flex flex-col items-center gap-2 text-zinc-500 hover:text-white transition-all active:scale-90">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                    <MessageCircle size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase">
                    {pick.commentCount || 0} Comments
                  </span>
                </button>

                {/* SHARE BUTTON - Integrated with Clipboard + Sonner */}
                <button
                  onClick={onShareClick}
                  className="flex flex-col items-center gap-2 text-zinc-500 hover:text-white transition-all active:scale-90"
                >
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-[#D4FF33]/40 transition-all">
                    <Share2 size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX */}
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
              className="absolute top-10 right-10 text-white p-4 bg-white/10 rounded-full z-[1000] hover:bg-white hover:text-black transition-all"
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
