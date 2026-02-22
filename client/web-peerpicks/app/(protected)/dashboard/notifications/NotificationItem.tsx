"use client";

import React from 'react';
import { Trash2, ShieldCheck, Zap, MessageSquare, Heart, Bell, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SignalIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'WELCOME': return <Zap className="text-[#D4FF33]" size={18} />;
    case 'SYSTEM': return <ShieldCheck className="text-blue-400" size={18} />;
    case 'VOTE': return <Heart className="text-pink-500" size={18} />;
    case 'COMMENT': return <MessageSquare className="text-indigo-400" size={18} />;
    case 'SAVE': return <Bell className="text-amber-400" size={18} />;
    case 'FOLLOW': return <UserPlus className="text-emerald-400" size={18} />;
    default: return <Zap size={18} />;
  }
};

export const NotificationItem = ({ n, onDelete }: { n: any, onDelete: (id: string, isUnread: boolean) => void }) => {
  const isSpecial = n.type === 'WELCOME' || n.type === 'SYSTEM';

  // IDENTITY ISOLATION LOGIC
  const getActorLabel = () => {
    if (n.type === 'SYSTEM') return "SYSTEM_NODE";
    if (n.type === 'WELCOME') return "PEERPICKS_TEAM";
    return n.actor?.fullName || n.actorName || "UNKNOWN_PEER";
  };

  const getContent = () => {
    if (n.message && n.message !== "null") return n.message;
    switch (n.type) {
      case 'VOTE': return "upvoted your pick";
      case 'COMMENT': return "replied to your review";
      case 'FOLLOW': return "started following you";
      case 'SAVE': return "favorited your pick";
      case 'WELCOME': return "Welcome to the node. Your signal is active.";
      case 'SYSTEM': return "System protocol updated.";
      default: return "New signal established.";
    }
  };

  return (
    <div className={`group relative flex items-center justify-between p-5 rounded-[2rem] border transition-all ${
      n.read ? 'bg-transparent border-white/[0.03]' : 'bg-white/[0.05] border-[#D4FF33]/20 shadow-[0_0_20px_rgba(212,255,51,0.05)]'
    }`}>
      
      <div className="flex gap-4 items-center">
        <div className="relative">
          {isSpecial ? (
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <SignalIcon type={n.type} />
            </div>
          ) : (
            <img 
              src={n.actor?.profilePicture || '/default-avatar.png'} 
              className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10" 
              alt="Peer Avatar" 
            />
          )}
          {!n.read && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4FF33] rounded-full animate-pulse border-2 border-black" />}
        </div>

        <div className="flex flex-col">
          <p className="text-sm leading-tight">
            <span className="font-bold text-white uppercase tracking-tight">
              {getActorLabel()}
            </span>
            <span className="text-zinc-300 ml-2">
              {getContent()}
            </span>
          </p>
          <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1">
             {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'} — NODE_SYNC
          </span>
        </div>
      </div>
      
      {/* DELETE PROTOCOL [2026-02-01] */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n._id, !n.read);
        }}
        className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
        title="Delete Signal"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};