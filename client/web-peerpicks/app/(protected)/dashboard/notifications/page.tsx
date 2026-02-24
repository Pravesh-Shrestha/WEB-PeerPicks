"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/app/context/DashboardContext";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { Inbox, BellRing, CheckCheck, Zap } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const { refreshTicket, triggerRefresh, handleDeleteSignal, markAsRead } = useDashboard();
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setLoading(true);
        // Syncing with the repository findByUserId logic
        const res: any = await axiosInstance.get(API.NOTIFICATIONS.GET_ALL);
        if (res.success) {
          setSignals(res.data);
        }
      } catch (err) {
        console.error("FEED_SYNC_FAILURE // CONNECTION_LOST");
      } finally {
        setLoading(false);
      }
    };
    fetchSignals();
  }, [refreshTicket]);

  const onMarkAllRead = async () => {
    try {
      await markAsRead();
      triggerRefresh(); // Refresh the local ticket to re-fetch signals
    } catch (err) {
      console.error("SYNC_CLEAR_FAILURE");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-start gap-4 p-12">
      <div className="relative">
        <Zap className="text-[#D4FF33] animate-pulse" size={24} />
        <div className="absolute inset-0 bg-[#D4FF33]/20 blur-lg rounded-full animate-ping" />
      </div>
      <p className="text-[10px] text-[#D4FF33] font-mono uppercase tracking-[0.5em]">
        Syncing_Neural_Feed...
      </p>
    </div>
  );

  return (
    <div className="w-full py-12 px-8 lg:px-12 space-y-10">
      {/* Header Protocol - Signal Feed ID */}
      <div className="flex flex-col gap-6 border-b border-white/5 pb-10">
        <div className="flex items-center justify-between w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BellRing className="text-[#D4FF33]" size={28} />
                {signals.some(s => !s.read) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse" />
                )}
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                Signal_Feed
              </h1>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] pl-10">
              Encrypted Data Inbound // {signals.length} Active Nodes
            </p>
          </div>

          {signals.length > 0 && (
            <button 
              onClick={onMarkAllRead}
              className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter py-3 px-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4FF33] hover:text-[#D4FF33] transition-all duration-500"
            >
              <CheckCheck size={14} className="group-hover:scale-110 transition-transform" /> 
              Clear_All_Sync
            </button>
          )}
        </div>
      </div>

      {/* Main Signal List - Timeline Architecture */}
      <div className="relative">
        {/* Decorative Vertical Timeline Line */}
        <div className="absolute left-[13px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#D4FF33]/30 via-white/5 to-transparent" />

        <div className="space-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {signals.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-start p-12 border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01] max-w-2xl"
              >
                <div className="p-6 bg-zinc-900/50 rounded-2xl mb-6 group transition-all duration-500 hover:bg-[#D4FF33]/5">
                  <Inbox size={32} strokeWidth={1} className="text-zinc-700 group-hover:text-[#D4FF33] transition-colors" />
                </div>
                <h3 className="text-white font-bold uppercase tracking-tighter mb-1 text-lg">Silence_Detected</h3>
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-zinc-600">
                  Neural memory modules are currently offline
                </p>
              </motion.div>
            ) : (
              signals.map((signal, index) => (
                <motion.div
                  key={signal._id}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.04, ease: "easeOut" } 
                  }}
                  exit={{ opacity: 0, x: -50, filter: "blur(8px)" }}
                  className="relative pl-10 group"
                >
                  {/* Connection Node Point */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[27px] h-[1px] bg-white/10 group-hover:bg-[#D4FF33]/40 transition-colors" />
                  <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-white/20 group-hover:bg-[#D4FF33] group-hover:border-[#D4FF33] transition-all" />
                  
                  <div className="max-w-3xl">
                    <NotificationItem 
                      n={signal} 
                      onDelete={(id, isUnread) => {
                        // Protocol [2026-02-01]: Using delete-specific terminology
                        handleDeleteSignal(id, isUnread);
                        triggerRefresh();
                      }} 
                    />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info Protocol */}
      {signals.length > 0 && (
        <div className="pt-10 pl-10">
          <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em] flex items-center gap-4">
            <span className="w-8 h-[1px] bg-zinc-800" />
            End of Signal Stream // Protocol Active [2026-02-01]
          </p>
        </div>
      )}
    </div>
  );
}