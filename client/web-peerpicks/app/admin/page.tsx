// app/admin/page.tsx
export default function AdminDashboard() {
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
          <h2 className="text-4xl font-black text-white mt-1">1,402</h2>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-xs text-gray-500 uppercase font-bold">New Today</p>
          <h2 className="text-4xl font-black text-[#D4FF33] mt-1">+24</h2>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-xs text-gray-500 uppercase font-bold">Active Admins</p>
          <h2 className="text-4xl font-black text-white mt-1">3</h2>
        </div>
      </div>

      {/* Recent Activity Mockup */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Latest Operations</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm text-gray-300">Identity Purge: <span className="text-white font-mono">USER_ID_88{i}</span></span>
              <span className="text-xs text-gray-600">SUCCESSFUL</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}