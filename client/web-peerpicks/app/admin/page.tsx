"use client";
import React, { useEffect, useState } from "react";
import { Users, Zap, ShieldCheck, Activity, Loader2 } from "lucide-react";
import StatCard from "./_components/stat-card";
import { handleAdminGetStats } from "@/lib/actions/auth-action"; // Server Action to fetch stats

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      // Use the Server Action to ensure standardized data shape
      const result = await handleAdminGetStats();
      
      if (result.success) {
        setData(result); // Contains result.stats and result.recentActivity
      }
      setLoading(false);
    };
    fetchTelemetry();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-[#D4FF33] animate-spin" size={40} />
        <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-[0.2em]">
          Accessing_Database_Metrics...
        </p>
      </div>
    );
  }

  // Map the stats from result.stats (as defined in your AdminController)
  const dashboardStats = data?.stats;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
          Terminal_Overview
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase mt-1">
          System Status: <span className="text-[#D4FF33] animate-pulse">Online // Synchronized</span>
        </p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total_Users" 
          value={dashboardStats?.totalUsers || "0"} 
          trend="Lifetime" 
          icon={Users} 
          color="#D4FF33" 
        />
        <StatCard 
          label="New_Today" 
          value={dashboardStats?.newToday || "0"} 
          trend="Handshakes" 
          icon={Activity} 
          color="#D4FF33" 
        />
        <StatCard 
          label="Root_Operators" 
          value={dashboardStats?.activeAdmins || "0"} 
          trend="Authorized" 
          icon={ShieldCheck} 
          color="#D4FF33" 
        />
        <StatCard 
          label="System_Health" 
          value="100%" 
          trend="Stable" 
          icon={Zap} 
          color="#555" 
        />
      </div>

      {/* RECENT ACTIVITY LIST */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Activity size={120} />
        </div>
        
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-[#D4FF33] rounded-full animate-ping" />
          Recent_Handshakes
        </h3>

        <div className="space-y-4 relative z-10">
          {data?.recentActivity?.length > 0 ? (
            data.recentActivity.map((user: any) => (
              <div 
                key={user._id} 
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2"
              >
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                     {user.fullName.charAt(0)}
                   </div>
                   <div>
                     <p className="text-xs font-bold text-white leading-none">{user.fullName}</p>
                     <p className="text-[9px] text-zinc-500 font-mono mt-1 uppercase">{user.role}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-mono text-[#D4FF33]">
                     {new Date(user.updatedAt).toLocaleDateString()}
                   </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-600 font-mono text-[10px] py-4 uppercase">No_Recent_Activity_Detected</p>
          )}
        </div>
      </div>
    </div>
  );
}