// app/admin/layout.tsx
import React from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Manage Peers", path: "/admin/users", icon: "👥" },
    { name: "Register New", path: "/admin/users/create", icon: "➕" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0C10]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0B0C10] p-6 fixed h-full">
        <div className="mb-10 px-2">
          <h2 className="text-[#D4FF33] font-black text-2xl italic">PEERPICKS</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Terminal</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-[#D4FF33] hover:bg-white/5 transition-all group"
            >
              <span>{item.icon}</span>
              <span className="font-bold text-sm uppercase italic group-hover:translate-x-1 transition-transform">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-white transition">
            ← Back to Main App
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}