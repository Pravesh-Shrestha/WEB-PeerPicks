"use client";

import React, { useEffect, useState, useMemo } from "react";
import { handleAdminGetAllPicks } from "@/lib/actions/pick-action";
import {
  Search,
  Database,
  Trash2,
  ExternalLink,
  MapPin,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usePicks } from "@/app/context/PickContext";

export default function AdminPicksPage() {
  const { picks = [], setPicks, deletePick, isPending } = usePicks();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

// 🔥 Registry Sync
useEffect(() => {
  let mounted = true;

  const syncRegistry = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await handleAdminGetAllPicks();

      if (!mounted) return;

      if (res && 'success' in res && res.success && Array.isArray(res.picks)) {
        setPicks(res.picks);
      } else {
        setError("Failed to load registry nodes.");
      }

    } catch (err) {
      if (!mounted) return;

      setError("Registry synchronization failed.");
      toast.error("PROTOCOL_SYNC_ERROR");
    } finally {
      if (mounted) setLoading(false);
    }
  };

  syncRegistry(); 

  return () => {
    mounted = false; 
  };
}, [setPicks]);

  // 🔎 Optimized Filter Logic
  const filteredRegistry = useMemo(() => {
    if (!Array.isArray(picks)) return [];

    const s = searchTerm.toLowerCase().trim();

    if (!s) return picks;

    return picks.filter((p) => {
      return (
        p?.alias?.toLowerCase().includes(s) ||
        p?.description?.toLowerCase().includes(s) ||
        p?.user?.fullName?.toLowerCase().includes(s) ||
        p?._id?.toLowerCase().includes(s)
      );
    });
  }, [picks, searchTerm]);

  // 🌀 Loading State
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#D4FF33]" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
          Syncing_Registry...
        </span>
      </div>
    );
  }

  // ❌ Error State
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-red-400 font-bold uppercase tracking-widest text-sm">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
            Pick_<span className="text-[#D4FF33]">Registry</span>
          </h1>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF33] animate-pulse" />
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                Nodes: {filteredRegistry.length}
              </span>
            </div>
            <span className="text-zinc-800 text-[10px] font-black uppercase tracking-widest">
              Protocol_2026-02-25
            </span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full xl:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#D4FF33] transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search_Nodes_By_Identity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-xs font-bold text-white focus:border-[#D4FF33]/40 outline-none transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {filteredRegistry.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                  <th className="px-8 py-6">Pick_Node</th>
                  <th className="px-8 py-6 text-center">Identity</th>
                  <th className="px-8 py-6">Registry_Location</th>
                  <th className="px-8 py-6 text-right">Protocol_Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRegistry.map((pick) => (
                  <tr
                    key={pick._id}
                    className="hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase italic truncate max-w-[250px]">
                          {pick.alias ||
                            pick.description ||
                            "Untitled_Entry"}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 mt-1 uppercase">
                          ID: {pick._id?.slice(-12)}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                          <User size={10} className="text-zinc-500" />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400">
                          {pick.user?.fullName || "Unverified"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-[#D4FF33]" />
                        <span className="text-[11px] font-bold text-zinc-400 uppercase truncate max-w-[150px]">
                          {pick.place?.name || "Global_Node"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-3">
                        <a
                          href={`/dashboard/picks/${pick._id}`}
                          target="_blank"
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
                        >
                          <ExternalLink size={14} />
                        </a>

                        <button
                          onClick={() => {
                            if (
                              confirm("Execute Permanent Delete?")
                            )
                              deletePick(pick._id);
                          }}
                          disabled={isPending}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center">
            <Database size={40} className="text-zinc-800 mb-4" />
            <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.4em]">
              Zero_Nodes_Matched
            </p>
          </div>
        )}
      </div>
    </div>
  );
}