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
  ShieldAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { usePicks } from "@/app/context/PickContext";

/**
 * ADMIN_PICK_REGISTRY_PAGE
 * Adheres to Protocol_2026-02-25
 * Features: Protocol Delete Modal, Optimized Filtering, and Sync Handshakes.
 */
export default function AdminPicksPage() {
  const { picks = [], setPicks, deletePick, isPending } = usePicks();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // State for the custom delete dialog
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncRegistry = async () => {
      try {
        setLoading(true);
        const res = await handleAdminGetAllPicks();

        if (!mounted) return;

        if (
          res &&
          "success" in res &&
          res.success &&
          Array.isArray(res.picks)
        ) {
          setPicks(res.picks);
          setTimeout(() => {
            if (mounted) setLoading(false);
          }, 50);
        } else {
          setError("Failed to load registry nodes.");
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("Registry synchronization failed.");
          setLoading(false);
        }
      }
    };

    syncRegistry();
    return () => {
      mounted = false;
    };
  }, [setPicks]);

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

  // Handler for permanent delete execution
  const executeDeleteProtocol = async () => {
    if (!targetDeleteId) return;
    try {
      await deletePick(targetDeleteId);
      setTargetDeleteId(null);
      toast.success("Node deleted successfully");
    } catch (err) {
      toast.error("Failed to execute delete protocol");
    }
  };

  if (loading) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center space-y-4"
        data-testid="registry-loader"
      >
        <Loader2 className="animate-spin text-[#D4FF33]" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
          Syncing_Registry...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center space-y-4 text-center"
        data-testid="registry-error-container"
      >
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-red-400 font-bold uppercase tracking-widest text-sm">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-10 space-y-8 max-w-[1600px] mx-auto relative"
      data-testid="admin-picks-container"
    >
      {/* 🛠️ PROTOCOL DELETE MODAL */}
      {targetDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isPending && setTargetDeleteId(null)}
          />
          <div
            className="relative bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            data-testid="delete-confirmation-modal"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="text-red-500" size={40} />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                Execute_Delete?
              </h2>
              <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
                Confirming this action will permanently remove node{" "}
                <span className="text-zinc-300 font-mono">
                  {targetDeleteId.slice(-8)}
                </span>{" "}
                from the registry. This operation cannot be undone.
              </p>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                disabled={isPending}
                onClick={() => setTargetDeleteId(null)}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={executeDeleteProtocol}
                data-testid="confirm-delete-button"
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Execute_Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1
            className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none"
            data-testid="page-header-title"
          >
            Pick_<span className="text-[#D4FF33]">Registry</span>
          </h1>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF33] animate-pulse" />
              <span
                className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest"
                data-testid="node-count-display"
              >
                Nodes: {filteredRegistry.length}
              </span>
            </div>
            <span
              className="text-zinc-800 text-[10px] font-black uppercase tracking-widest"
              data-testid="protocol-version-tag"
            >
              Protocol_2026-02-25
            </span>
          </div>
        </div>

        <div className="relative w-full xl:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#D4FF33] transition-colors"
            size={16}
          />
          <input
            type="text"
            data-testid="registry-search-input"
            placeholder="Search_Nodes_By_Identity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-xs font-bold text-white focus:border-[#D4FF33]/40 outline-none transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* REGISTRY TABLE */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {filteredRegistry.length > 0 ? (
          <div className="overflow-x-auto">
            <table
              className="w-full text-left border-collapse"
              data-testid="registry-table"
            >
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
                    data-testid={`registry-row-${pick._id}`}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-bold text-white uppercase italic truncate max-w-[250px]"
                          data-testid="pick-alias-text"
                        >
                          {pick.alias || pick.description || "Untitled_Entry"}
                        </span>
                        <span
                          className="text-[9px] font-mono text-zinc-600 mt-1 uppercase"
                          data-testid="pick-id-suffix"
                        >
                          ID: {pick._id?.slice(-12)}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                          <User size={10} className="text-zinc-500" />
                        </div>
                        <span
                          className="text-[11px] font-bold text-zinc-400"
                          data-testid="pick-author-name"
                        >
                          {pick.user?.fullName || "Unverified"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-[#D4FF33]" />
                        <span
                          className="text-[11px] font-bold text-zinc-400 uppercase truncate max-w-[150px]"
                          data-testid="pick-location-name"
                        >
                          {pick.place?.name || "Global_Node"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-3">
                        <a
                          href={`/dashboard/picks/${pick._id}`}
                          target="_blank"
                          data-testid="external-link-node"
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
                        >
                          <ExternalLink size={14} />
                        </a>

                        <button
                          data-testid="delete-protocol-button"
                          onClick={() => setTargetDeleteId(pick._id)}
                          disabled={isPending}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="py-24 text-center flex flex-col items-center"
            data-testid="empty-registry-state"
          >
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
