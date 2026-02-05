"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, TrendingUp, Shield, Activity, 
  Clock, CheckCircle2, Loader2, Zap, 
  BarChart3, Eye
} from "lucide-react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

interface DashboardData {
  stats: {
    totalUsers: number;
    newToday: number;
    activeAdmins: number;
  };
  recentActivity: Array<{
    _id: string;
    fullName: string;
    updatedAt: string;
    role: string;
    profilePicture?: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get(API.ADMIN.STATS);
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative overflow-hidden bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10]">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 50%, rgba(93, 68, 248, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(212, 255, 51, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(93, 68, 248, 0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="text-[#D4FF33]" size={40} />
        </motion.div>
        <motion.p 
          className="text-[10px] font-black uppercase tracking-[0.3em] text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Accessing Encrypted Data...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#5D44F8]/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, 30, 0],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#D4FF33]/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1.15, 1, 1.15],
            x: [0, -20, 0],
            y: [0, -30, 0],
            opacity: [0.4, 0.3, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            className="p-2.5 bg-gradient-to-br from-[#5D44F8] to-[#4a35c9] rounded-xl shadow-xl"
          >
            <BarChart3 size={24} className="text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tighter">
            Overview
          </h1>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm sm:text-base text-gray-400 flex items-center gap-2"
        >
          <Activity size={14} className="text-[#D4FF33]" />
          Real-time system statistics and peer activity.
        </motion.p>
      </motion.header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        <MetricCard
          icon={Users}
          label="Total Users"
          value={data?.stats.totalUsers.toLocaleString() || "0"}
          color="white"
          delay={0.3}
        />
        <MetricCard
          icon={TrendingUp}
          label="New Today"
          value={`+${data?.stats.newToday || 0}`}
          color="#D4FF33"
          delay={0.35}
          highlight
        />
        <MetricCard
          icon={Shield}
          label="Active Admins"
          value={data?.stats.activeAdmins?.toString() || "0"}
          color="white"
          delay={0.4}
        />
      </div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl relative z-10 overflow-hidden"
      >
        {/* Background glow */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 bg-[#5D44F8]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex items-center justify-between mb-6">
          <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-[#D4FF33]" />
            Latest Operations
          </h3>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Eye size={16} className="text-gray-600" />
          </motion.div>
        </div>

        <div className="space-y-3 sm:space-y-4 relative">
          <AnimatePresence mode="popLayout">
                          {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((user, index) => (
                  <motion.div
                    key={user._id}
                    // ... your existing motion props ...
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3 sm:pb-4 last:border-b-0 gap-2 sm:gap-0 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Profile Image Container */}
                      <motion.div 
                        className="relative flex-shrink-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      >
                        {user.profilePicture ? (
                          <div className="relative">
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`} 
                              alt={user.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-[#D4FF33]/50 transition-colors shadow-lg"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#D4FF33] border-2 border-[#0B0C10] rounded-full" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5D44F8] to-[#1a1d29] flex items-center justify-center border border-white/10 group-hover:border-[#D4FF33]/50 transition-all shadow-lg">
                            <Users size={18} className="text-white/50" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-500 border-2 border-[#0B0C10] rounded-full" />
                          </div>
                        )}
                      </motion.div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-300">
                            Modified Peer: <span className="text-white font-bold italic tracking-tight">{user.fullName}</span>
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-gray-600 font-mono">
                          ID: {user._id.substring(0, 16)}...
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right ml-[52px] sm:ml-0">
                      <motion.span 
                        // ... your existing status props ...
                        className="text-[9px] sm:text-[10px] text-[#D4FF33] flex sm:justify-end items-center gap-1.5 font-bold mb-1"
                      >
                        <CheckCircle2 size={12} />
                        SYNC_COMPLETE
                      </motion.span>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase flex items-center gap-1.5">
                        <Zap size={10} className="text-gray-600" />
                        {new Date(user.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="text-gray-600 italic text-xs sm:text-sm py-8 text-center"
              >
                No recent activity logged.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  delay, 
  highlight = false 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string; 
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-5 sm:p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl relative overflow-hidden group ${
        highlight ? 'ring-1 ring-[#D4FF33]/30' : ''
      }`}
    >
      {/* Background glow */}
      <motion.div 
        className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl ${
          highlight ? 'bg-[#D4FF33]/10' : 'bg-[#5D44F8]/10'
        }`}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex items-start justify-between mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.1, type: "spring", stiffness: 300, damping: 20 }}
          className={`p-2.5 rounded-xl ${
            highlight 
              ? 'bg-[#D4FF33]/20 border border-[#D4FF33]/30' 
              : 'bg-white/10 border border-white/20'
          }`}
        >
          <Icon 
            size={20} 
            className={highlight ? 'text-[#D4FF33]' : 'text-white'} 
            strokeWidth={2.5}
          />
        </motion.div>
        
        {highlight && (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-[#D4FF33]"
          />
        )}
      </div>

      <div className="relative">
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
          {label}
        </p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2, duration: 0.3 }}
          className="text-3xl sm:text-4xl font-black mt-1 tracking-tight"
          style={{ color }}
        >
          {value}
        </motion.h2>
      </div>

      {/* Hover effect line */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${
          highlight ? 'bg-[#D4FF33]' : 'bg-[#5D44F8]'
        }`}
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}