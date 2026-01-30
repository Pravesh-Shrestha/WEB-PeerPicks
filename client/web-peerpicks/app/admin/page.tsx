"use client";
import React, { useEffect, useState } from "react";
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
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-20 text-white animate-pulse italic">ACCESSING ENCRYPTED DATA...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white uppercase italic">Overview</h1>
        <p className="text-gray-400">Real-time system statistics and peer activity.</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-xs text-gray-500 uppercase font-bold">Total Users</p>
          <h2 className="text-4xl font-black text-white mt-1">
            {data?.stats.totalUsers.toLocaleString()}
          </h2>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-xs text-gray-500 uppercase font-bold">New Today</p>
          <h2 className="text-4xl font-black text-[#D4FF33] mt-1">
            +{data?.stats.newToday}
          </h2>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-xs text-gray-500 uppercase font-bold">Active Admins</p>
          <h2 className="text-4xl font-black text-white mt-1">
            {data?.stats.activeAdmins}
          </h2>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Latest Operations</h3>
        <div className="space-y-4">
          {data?.recentActivity.map((user) => (
            <div key={user._id} className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-300">
                  Modified Peer: <span className="text-white font-bold italic">{user.fullName}</span>
                </span>
                <span className="text-[10px] text-gray-600 font-mono">ID: {user._id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#D4FF33] block font-bold">SYNC_COMPLETE</span>
                <span className="text-[9px] text-gray-500 uppercase">
                  {new Date(user.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {data?.recentActivity.length === 0 && (
            <div className="text-gray-600 italic text-sm py-4">No recent activity logged.</div>
          )}
        </div>
      </div>
    </div>
  );
}