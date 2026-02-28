"use client";

import React from "react";
import {
  Trash2,
  ShieldCheck,
  Zap,
  MessageSquare,
  Heart,
  Bell,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation"; 

const SignalIcon = ({ type }: { type: string }) => {
  const iconSize = 16;
  switch (type) {
    case "WELCOME": return <Zap className="text-[#D4FF33]" size={iconSize} />;
    case "SYSTEM": return <ShieldCheck className="text-blue-400" size={iconSize} />;
    case "VOTE": return <Heart className="text-pink-500" size={iconSize} />;
    case "COMMENT": return <MessageSquare className="text-indigo-400" size={iconSize} />;
    case "SAVE": return <Bell className="text-amber-400" size={iconSize} />;
    case "FOLLOW": return <UserPlus className="text-emerald-400" size={iconSize} />;
    default: return <Zap className="text-[#D4FF33]" size={iconSize} />;
  }
};

export const NotificationItem = ({
  n,
  onDelete,
}: {
  n: any;
  onDelete: (id: string, isUnread: boolean) => void;
}) => {
  const router = useRouter();
  const isSpecial = n.type === "WELCOME" || n.type === "SYSTEM";

  const actorId = n?.actor?._id || n?.actor?.id || n?.actorId;

  const handleActorClick = (e: React.MouseEvent) => {
    if (n.type !== "FOLLOW" || !actorId) return;
    e.stopPropagation();
    router.push(`/dashboard/profile/${actorId}`);
  };

  const handleSignalClick = () => {
    // Navigate using 'pickId' which aligns with your Repository populate
    if (n.pickId) {
      router.push(`/dashboard/picks/${n.pickId._id || n.pickId}`);
    }
  };

  const getActorLabel = () => {
    if (n.type === "SYSTEM") return "System";
    if (n.type === "WELCOME") return "PeerPicks";
    // Uses the 'actorName' provided by your repository's fallback logic
    return n.actor?.fullName || n.actorName || "Someone";
  };

  const getContent = () => {
    // Priority 1: Use the 'message' field from the DB
    if (n.message && n.message !== "null") return n.message;
    
    // Priority 2: Use UI-side fallback mapping
    switch (n.type) {
      case "VOTE": return "upvoted your pick.";
      case "COMMENT": return "broadcasted a new signal on your pick.";
      case "FOLLOW": return "started following you.";
      case "SAVE": return "favorited your pick.";
      case "WELCOME": return "Welcome to PeerPicks.";
      default: return "New signal established.";
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all duration-500 ${
        n.read
          ? "bg-transparent border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10"
          : "bg-[#D4FF33]/[0.02] border-[#D4FF33]/10 shadow-[0_0_30px_rgba(212,255,51,0.03)] hover:bg-[#D4FF33]/[0.05]"
      }`}
    >
      {/* 1. Icon / Avatar Section */}
      <div className="relative flex-shrink-0">
        {isSpecial ? (
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            <SignalIcon type={n.type} />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleActorClick}
            aria-label={n.type === "FOLLOW" ? "Open follower profile" : "Notification actor"}
            className={`relative ${n.type === "FOLLOW" && actorId ? "cursor-pointer" : "cursor-default"}`}
          >
            <img
              src={n.actor?.profilePicture || "/default-avatar.png"}
              className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700 border border-white/10"
              alt="Peer"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-black rounded-lg border border-white/5">
              <SignalIcon type={n.type} />
            </div>
          </button>
        )}
        {!n.read && (
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#D4FF33] rounded-full animate-pulse shadow-[0_0_10px_#D4FF33]" />
        )}
      </div>

      {/* 2. Text Content - Interactive Area */}
      <div 
        onClick={handleSignalClick} 
        title={n.pickId ? "Open related post" : "Notification"}
        className="flex-1 cursor-pointer group/text"
      >
        <div className="flex flex-col">
          <p className="text-sm leading-snug">
            <span className="font-black text-white uppercase tracking-tighter italic">
              {getActorLabel()}
            </span>
            <span className="text-zinc-400 ml-2 font-medium">
              {getContent()}
            </span>
          </p>
          
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
              {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : "Just now"}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
              Notification
            </span>
            {n.pickId && (
              <span className="flex items-center gap-1 text-[9px] font-black text-[#D4FF33] opacity-0 group-hover/text:opacity-100 transition-opacity uppercase ml-2">
                View_Signal <ArrowUpRight size={10} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Action Section - DELETE PROTOCOL [2026-02-01] */}
      <div className="flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(n._id, !n.read);
          }}
          aria-label="Delete notification"
          className="p-3 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
          title="Delete notification"
        >
          <Trash2 size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};