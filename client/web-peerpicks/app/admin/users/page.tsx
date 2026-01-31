"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, Edit3, Trash2, Shield, 
  User, Search, Loader2, AlertCircle, Database,
  Filter, ChevronDown
} from "lucide-react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import Link from "next/link";

export default function ManagePeers() {
  const [peers, setPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      await axiosInstance.delete(`${API.ADMIN.USERS}/${id}`);
      setPeers((prev) => prev.filter((peer) => peer._id !== id));
      alert("Identity purged successfully.");
    } catch (err) {
      console.error("Purge Error:", err);
      alert("Terminal Error: Could not purge identity.");
    }
  };

  // Filter and sort peers
  const getFilteredAndSortedPeers = () => {
    let filtered = [...peers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(peer => 
        peer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(peer => peer.role === roleFilter);
    }

    // Apply gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter(peer => peer.gender === genderFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.fullName || "").localeCompare(b.fullName || "");
        case "name-desc":
          return (b.fullName || "").localeCompare(a.fullName || "");
        case "date-newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "date-oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "role":
          return (a.role || "").localeCompare(b.role || "");
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredPeers = getFilteredAndSortedPeers();

  // Get unique values for filters
  const uniqueRoles = Array.from(new Set(peers.map(p => p.role).filter(Boolean)));
  const uniqueGenders = Array.from(new Set(peers.map(p => p.gender).filter(Boolean)));

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setGenderFilter("all");
    setSortBy("name-asc");
  };

  const hasActiveFilters = searchQuery || roleFilter !== "all" || genderFilter !== "all" || sortBy !== "name-asc";

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative overflow-hidden">
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
          Scanning Database...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 relative">
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
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            className="p-2.5 bg-gradient-to-br from-[#5D44F8] to-[#4a35c9] rounded-xl shadow-xl"
          >
            <Database size={24} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
              Peer Database
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mt-0.5">
              {filteredPeers.length} Active Identities
            </p>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link 
            href="/admin/users/create" 
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#D4FF33] to-[#b8d928] hover:from-[#b8d928] hover:to-[#D4FF33] text-black px-5 py-3 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-wider shadow-xl hover:shadow-[#D4FF33]/40 transition-all duration-200 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <UserPlus size={16} className="relative z-10" />
            <span className="relative z-10">Register Peer</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, ID, role, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10 focus:border-[#D4FF33]/50 outline-none rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 transition-all duration-200 backdrop-blur-xl"
          />
        </div>
      </motion.div>

      {/* Filters and Sorting */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* Filter Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:border-[#D4FF33]/30 transition-all duration-200 mb-4"
        >
          <Filter size={16} />
          <span className="uppercase tracking-wider text-[11px]">Filters & Sort</span>
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} />
          </motion.div>
          {hasActiveFilters && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-[#D4FF33]"
            />
          )}
        </motion.button>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-4 sm:p-5 backdrop-blur-xl mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white outline-none focus:border-[#D4FF33]/50 transition-all duration-200"
                    >
                      <option value="all" className="bg-[#1a1d29]">All Roles</option>
                      {uniqueRoles.map(role => (
                        <option key={role} value={role} className="bg-[#1a1d29]">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
                      Gender
                    </label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white outline-none focus:border-[#D4FF33]/50 transition-all duration-200"
                    >
                      <option value="all" className="bg-[#1a1d29]">All Genders</option>
                      {uniqueGenders.map(gender => (
                        <option key={gender} value={gender} className="bg-[#1a1d29]">
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white outline-none focus:border-[#D4FF33]/50 transition-all duration-200"
                    >
                      <option value="name-asc" className="bg-[#1a1d29]">Name (A-Z)</option>
                      <option value="name-desc" className="bg-[#1a1d29]">Name (Z-A)</option>
                      <option value="date-newest" className="bg-[#1a1d29]">Newest First</option>
                      <option value="date-oldest" className="bg-[#1a1d29]">Oldest First</option>
                      <option value="role" className="bg-[#1a1d29]">Role</option>
                    </select>
                  </div>

                  {/* Reset Button */}
                  <div className="flex items-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetFilters}
                      disabled={!hasActiveFilters}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-[#D4FF33]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset All
                    </motion.button>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">
                      Active:
                    </span>
                    {searchQuery && (
                      <span className="px-2 py-1 bg-[#D4FF33]/10 border border-[#D4FF33]/30 rounded-lg text-[10px] font-bold text-[#D4FF33]">
                        Search: "{searchQuery}"
                      </span>
                    )}
                    {roleFilter !== "all" && (
                      <span className="px-2 py-1 bg-[#5D44F8]/10 border border-[#5D44F8]/30 rounded-lg text-[10px] font-bold text-[#5D44F8]">
                        Role: {roleFilter}
                      </span>
                    )}
                    {genderFilter !== "all" && (
                      <span className="px-2 py-1 bg-[#5D44F8]/10 border border-[#5D44F8]/30 rounded-lg text-[10px] font-bold text-[#5D44F8]">
                        Gender: {genderFilter}
                      </span>
                    )}
                    {sortBy !== "name-asc" && (
                      <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-[10px] font-bold text-gray-400">
                        Sort: {sortBy.replace("-", " ").toUpperCase()}
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Peers Table */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl relative z-10"
      >
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    Identity
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield size={14} />
                    Role
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredPeers.map((peer, index) => (
                  <motion.tr 
                    key={peer._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: 0.35 + index * 0.03, duration: 0.3, ease: "easeOut" }}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.03, type: "spring", stiffness: 300 }}
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5D44F8] to-[#4a35c9] flex items-center justify-center text-white font-black text-sm"
                        >
                          {peer.fullName?.charAt(0).toUpperCase() || 'P'}
                        </motion.div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm">{peer.fullName}</span>
                          <span className="text-[10px] text-gray-600 font-mono">{peer._id.substring(0, 16)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.45 + index * 0.03, type: "spring" }}
                        className={`inline-flex items-center gap-1.5 text-[9px] px-3 py-1.5 rounded-lg border ${
                          peer.role === 'admin' 
                            ? 'border-[#D4FF33]/30 bg-[#D4FF33]/10 text-[#D4FF33]' 
                            : 'border-white/20 bg-white/5 text-gray-400'
                        } uppercase font-bold`}
                      >
                        {peer.role === 'admin' && <Shield size={10} />}
                        {peer.role}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link 
                            href={`/admin/users/${peer._id}/edit`} 
                            className="inline-flex items-center gap-1.5 text-[#D4FF33] text-xs font-bold hover:text-[#b8d928] transition-colors"
                          >
                            <Edit3 size={14} />
                            EDIT
                          </Link>
                        </motion.div>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePurge(peer._id)}
                          className="inline-flex items-center gap-1.5 text-red-500 text-xs font-bold hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                          PURGE
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/5">
          <AnimatePresence mode="popLayout">
            {filteredPeers.map((peer, index) => (
              <motion.div
                key={peer._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: 0.35 + index * 0.03, duration: 0.3, ease: "easeOut" }}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.03, type: "spring", stiffness: 300 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5D44F8] to-[#4a35c9] flex items-center justify-center text-white font-black"
                  >
                    {peer.fullName?.charAt(0).toUpperCase() || 'P'}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm mb-1">{peer.fullName}</h3>
                    <p className="text-[10px] text-gray-600 font-mono mb-2">{peer._id.substring(0, 16)}...</p>
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.45 + index * 0.03, type: "spring" }}
                      className={`inline-flex items-center gap-1.5 text-[9px] px-3 py-1 rounded-lg border ${
                        peer.role === 'admin' 
                          ? 'border-[#D4FF33]/30 bg-[#D4FF33]/10 text-[#D4FF33]' 
                          : 'border-white/20 bg-white/5 text-gray-400'
                      } uppercase font-bold`}
                    >
                      {peer.role === 'admin' && <Shield size={10} />}
                      {peer.role}
                    </motion.span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <Link 
                    href={`/admin/users/${peer._id}/edit`} 
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[#D4FF33] text-xs font-bold hover:text-[#b8d928] transition-colors py-2 px-3 bg-white/5 rounded-lg"
                  >
                    <Edit3 size={14} />
                    EDIT
                  </Link>
                  <button 
                    onClick={() => handlePurge(peer._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-red-500 text-xs font-bold hover:text-red-400 transition-colors py-2 px-3 bg-white/5 rounded-lg"
                  >
                    <Trash2 size={14} />
                    PURGE
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredPeers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="p-12 sm:p-20 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4"
            >
              <AlertCircle size={32} className="text-gray-600" />
            </motion.div>
            <p className="text-gray-600 uppercase italic tracking-wider text-sm mb-3">
              {hasActiveFilters ? "No peers match your filters" : "No active peers detected in sector"}
            </p>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-4 py-2 bg-[#D4FF33]/10 border border-[#D4FF33]/30 rounded-lg text-[#D4FF33] text-xs font-bold uppercase tracking-wider hover:bg-[#D4FF33]/20 transition-all duration-200"
              >
                Clear All Filters
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}