// /admin/page.tsx
import React from "react";

const stats = [
  { label: "Total Peers", value: "1,284", change: "+12%", color: "#D4FF33" },
  { label: "Active Sessions", value: "432", change: "+5%", color: "#00E0FF" },
  { label: "Pending Verifications", value: "18", change: "-2", color: "#FF3366" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 bg-[#0B0C10] min-h-screen text-white">
      <header className="mb-10">
        <h1 className="text-3xl font-black uppercase italic text-[#D4FF33]">Terminal Dashboard</h1>
        <p className="text-gray-400">System Overview & Peer Metrics</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <p className="text-sm text-gray-400 uppercase font-bold">{stat.label}</p>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black">{stat.value}</span>
              <span className="text-xs mb-2" style={{ color: stat.color }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-4 uppercase text-sm">Recent Logs</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((log) => (
              <div key={log} className="flex justify-between text-sm border-b border-white/5 pb-2">
                <span className="text-gray-300">New user registration: <b className="text-white">peer_772</b></span>
                <span className="text-gray-500 text-xs">2 mins ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-4 uppercase text-sm">System Shortcuts</h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/users/create" className="bg-[#D4FF33] text-black p-4 rounded-xl font-black text-center text-xs uppercase italic">
              Create User
            </a>
            <a href="/admin/users" className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl font-black text-center text-xs uppercase italic transition">
              Manage Database
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}