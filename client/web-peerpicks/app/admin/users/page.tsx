"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import Link from "next/link";

export default function ManagePeers() {
  const [peers, setPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all peers on component mount
  const fetchPeers = async () => {
    try {
      const res = await axiosInstance.get(API.ADMIN.USERS);
      setPeers(res.data.users || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers();
  }, []);

  // Handle Purge (Delete) Action
  const handlePurge = async (id: string) => {
    if (!id) return;
    
    const confirmPurge = confirm("CAUTION: Are you sure you want to purge this identity from the database?");
    if (!confirmPurge) return;

    try {
      // API.ADMIN.USERS is '/api/admin/users'
      await axiosInstance.delete(`${API.ADMIN.USERS}/${id}`);
      
      // Update local state immediately for a fast UI response
      setPeers((prev) => prev.filter((peer) => peer._id !== id));
      alert("Identity purged successfully.");
    } catch (err) {
      console.error("Purge Error:", err);
      alert("Terminal Error: Could not purge identity.");
    }
  };

  if (loading) return <div className="p-20 text-white animate-pulse uppercase tracking-widest">Scanning Database...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white uppercase italic">Peer Database</h1>
        <Link href="/admin/users/create" className="bg-[#D4FF33] text-black px-4 py-2 rounded-lg font-bold uppercase text-xs hover:scale-105 transition-transform">
          + Register Peer
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {peers.map((peer) => (
              <tr key={peer._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{peer.fullName}</span>
                    <span className="text-[10px] text-gray-600 font-mono">{peer._id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] px-2 py-0.5 rounded border ${
                    peer.role === 'admin' ? 'border-[#D4FF33] text-[#D4FF33]' : 'border-white/20 text-gray-400'
                  } uppercase font-bold`}>
                    {peer.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/users/${peer._id}/edit`} 
                    className="text-[#D4FF33] text-xs font-bold mr-6 hover:underline"
                  >
                    EDIT
                  </Link>
                  <button 
                    onClick={() => handlePurge(peer._id)}
                    className="text-red-500 text-xs font-bold hover:text-red-400 transition-colors"
                  >
                    PURGE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {peers.length === 0 && (
          <div className="p-20 text-center text-gray-600 uppercase italic tracking-tighter">
            No active peers detected in sector.
          </div>
        )}
      </div>
    </div>
  );
}