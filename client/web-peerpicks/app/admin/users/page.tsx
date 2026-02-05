"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Shield,
  User,
  Search,
  Loader2,
  AlertCircle,
  Database,
  Filter,
  ChevronDown,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import Link from "next/link";

// Toast Component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Smoother ease
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
        type === "success"
          ? "bg-gradient-to-br from-[#D4FF33]/20 to-[#D4FF33]/10 border-[#D4FF33]/30"
          : "bg-gradient-to-br from-red-500/20 to-red-500/10 border-red-500/30"
      } min-w-[320px]`}
    >
      {type === "success" ? (
        <CheckCircle className="text-[#D4FF33]" size={20} />
      ) : (
        <AlertCircle className="text-red-500" size={20} />
      )}
      <p
        className={`flex-1 text-sm font-bold ${type === "success" ? "text-[#D4FF33]" : "text-red-400"}`}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className={`${type === "success" ? "text-[#D4FF33]/60 hover:text-[#D4FF33]" : "text-red-400/60 hover:text-red-400"} transition-colors`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

// Delete Confirmation Dialog
function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  peerName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  peerName: string;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#1a1d29] to-[#13151f] border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={32} />
          </div>

          <h3 className="text-2xl font-black text-white text-center uppercase italic mb-3">
            Delete Identity
          </h3>

          <p className="text-gray-400 text-center mb-2 text-sm">
            Are you sure you want to delete
          </p>
          <p className="text-white font-bold text-center mb-6 text-lg">
            "{peerName}"?
          </p>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-xs text-center font-medium">
              This action cannot be undone. All associated data will be
              permanently removed from the database.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase text-sm hover:bg-white/10 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold uppercase text-sm rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ManagePeers() {
  const [peers, setPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    peerId: string;
    peerName: string;
  }>({
    isOpen: false,
    peerId: "",
    peerName: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPeers = async () => {
    try {
      const res = await axiosInstance.get(API.ADMIN.USERS);
      setPeers(res.data.users || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setToast({
        message: "Failed to load peers from database",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers();
  }, []);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, peerId: id, peerName: name });
  };

  const handleDeleteConfirm = async () => {
    const { peerId } = deleteDialog;
    setDeleteDialog({ isOpen: false, peerId: "", peerName: "" });

    try {
      await axiosInstance.delete(`${API.ADMIN.USERS}/${peerId}`);
      setPeers((prev) => prev.filter((peer) => peer._id !== peerId));
      setToast({ message: "Identity deleted successfully", type: "success" });
    } catch (err) {
      console.error("Delete Error:", err);
      setToast({ message: "Failed to delete identity", type: "error" });
    }
  };

  // Filter and sort peers
  const filteredPeers = useMemo(() => {
    let filtered = [...peers];

    if (searchQuery) {
      filtered = filtered.filter(
        (peer) =>
          peer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          peer._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          peer.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          peer.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((peer) => peer.role === roleFilter);
    }

    if (genderFilter !== "all") {
      filtered = filtered.filter((peer) => peer.gender === genderFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.fullName || "").localeCompare(b.fullName || "");
        case "name-desc":
          return (b.fullName || "").localeCompare(a.fullName || "");
        case "date-newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "date-oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "role":
          return (a.role || "").localeCompare(b.role || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [peers, searchQuery, roleFilter, genderFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPeers.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);

  const paginatedPeers = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredPeers.slice(start, start + itemsPerPage);
  }, [filteredPeers, safeCurrentPage]);

  // Gentle reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, genderFilter, sortBy]);

  const uniqueRoles = Array.from(
    new Set(peers.map((p) => p.role).filter(Boolean)),
  );
  const uniqueGenders = Array.from(
    new Set(peers.map((p) => p.gender).filter(Boolean)),
  );

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setGenderFilter("all");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    searchQuery ||
    roleFilter !== "all" ||
    genderFilter !== "all" ||
    sortBy !== "name-asc";

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#D4FF33]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          Loading Database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, peerId: "", peerName: "" })
        }
        onConfirm={handleDeleteConfirm}
        peerName={deleteDialog.peerName}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#5D44F8] to-[#4a35c9] rounded-xl shadow-lg">
            <Database size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">
              Peer Database
            </h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF33]" />
              {filteredPeers.length} Active{" "}
              {filteredPeers.length === 1 ? "Identity" : "Identities"}
            </p>
          </div>
        </div>

        <Link
          href="/admin/users/create"
          className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#D4FF33] to-[#b8d928] hover:from-[#b8d928] hover:to-[#D4FF33] text-black px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <UserPlus size={16} />
          <span>Register Peer</span>
        </Link>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name, ID, role, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10 focus:border-[#D4FF33]/50 outline-none rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 transition-all duration-300 backdrop-blur-xl"
        />
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2.5 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:border-[#D4FF33]/30 transition-all duration-300 mb-4"
        >
          <Filter size={16} />
          <span className="uppercase tracking-wide text-[11px]">
            Advanced Filters
          </span>
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} />
          </motion.div>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#D4FF33] animate-pulse" />
          )}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-5 backdrop-blur-xl shadow-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-gray-500 ml-1">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#D4FF33]/50 transition-all"
                  >
                    <option value="all">All Roles</option>
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-gray-500 ml-1">
                    Gender
                  </label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#D4FF33]/50 transition-all"
                  >
                    <option value="all">All Genders</option>
                    {uniqueGenders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-gray-500 ml-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#D4FF33]/50 transition-all"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="date-newest">Newest First</option>
                    <option value="date-oldest">Oldest First</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl shadow-xl"
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-white/10 to-white/5 text-[10px] uppercase text-gray-400 font-black border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="wait">
                {" "}
                {/* Smoother page transition */}
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="contents" // Needed to keep table structure intact
                >
                  {paginatedPeers.map((peer) => (
                    <motion.tr
                      key={peer._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#5D44F8] flex items-center justify-center text-white font-black text-sm shadow-md">
                            {peer.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">
                              {peer.fullName}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">
                              {peer._id.substring(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[9px] px-3.5 py-2 rounded-lg border font-black uppercase tracking-wider ${
                            peer.role === "admin"
                              ? "border-[#D4FF33]/30 bg-[#D4FF33]/10 text-[#D4FF33]"
                              : "border-white/20 text-gray-400"
                          }`}
                        >
                          {peer.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/users/${peer._id}/edit`}
                            className="text-[#D4FF33] text-xs font-black uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-[#D4FF33]/10 transition-all"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteClick(peer._id, peer.fullName)
                            }
                            className="text-red-500 text-xs font-black uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.div>
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-white/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {paginatedPeers.map((peer) => (
                <div key={peer._id} className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#5D44F8] flex items-center justify-center text-white font-black text-lg">
                      {peer.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base mb-1">
                        {peer.fullName}
                      </h3>
                      <p className="text-[10px] text-gray-600 font-mono mb-2">
                        {peer._id.substring(0, 12)}...
                      </p>
                      <span className="text-[9px] px-2 py-1 bg-white/5 border border-white/10 rounded uppercase text-gray-400">
                        {peer.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/users/${peer._id}/edit`}
                      className="flex-1 text-center text-[#D4FF33] text-[10px] font-black py-3 border border-[#D4FF33]/20 rounded-xl uppercase"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(peer._id, peer.fullName)}
                      className="flex-1 text-center text-red-500 text-[10px] font-black py-3 border border-red-500/20 rounded-xl uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredPeers.length === 0 && (
          <div className="p-16 text-center">
            <AlertCircle size={36} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 uppercase italic font-bold text-sm tracking-wider">
              Database Empty or No Match Found
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
              Showing {paginatedPeers.length} of {filteredPeers.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-20 hover:bg-[#D4FF33] hover:text-black transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${
                        safeCurrentPage === num
                          ? "bg-[#D4FF33] text-black shadow-lg shadow-[#D4FF33]/20"
                          : "bg-white/5 text-gray-500 hover:text-white"
                      }`}
                    >
                      {num}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-20 hover:bg-[#D4FF33] hover:text-black transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
