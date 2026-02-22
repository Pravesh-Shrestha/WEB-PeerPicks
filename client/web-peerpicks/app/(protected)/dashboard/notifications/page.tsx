"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/app/context/DashboardContext";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { Inbox, BellRing, CheckCheck } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const { refreshTicket, triggerRefresh, handleDeleteSignal, markAsRead } = useDashboard();
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res: any = await axiosInstance.get(API.NOTIFICATIONS.GET_ALL);
        if (res.success) {
          setSignals(res.data);
        }
      } catch (err) {
        console.error("FEED_SYNC_FAILURE");
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [refreshTicket]);

  const onMarkAllRead = async () => {
    await markAsRead();
    triggerRefresh();
  };

  if (loading) return (
    <div className="p-10 text-[#D4FF33] font-mono animate-pulse uppercase tracking-widest">
      Synchronizing_Node...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Protocol */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D4FF33]/10 rounded-xl">
            <BellRing className="text-[#D4FF33]" size={20} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">Signal_Feed</h1>
        </div>
        
        {signals.length > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="flex items-center gap-2 text-[10px] font-bold uppercase py-2.5 px-5 rounded-full bg-white/5 border border-white/10 hover:border-[#D4FF33] hover:text-[#D4FF33] transition-all duration-300"
          >
            <CheckCheck size={14} /> Mark All Synchronized
          </button>
        )}
      </div>

      {/* Main Signal List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {signals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-[3rem]"
            >
              <Inbox size={48} strokeWidth={1} className="mb-4 text-zinc-800" />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600">Node Memory Empty</p>
            </motion.div>
          ) : (
            signals.map((signal) => (
              <motion.div
                key={signal._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationItem 
                  n={signal} 
                  onDelete={handleDeleteSignal} 
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}