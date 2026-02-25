"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2,  
  Shield, 
  User, 
  Search,
  Loader2,
  UserPlus,
  RefreshCcw,
  Edit3
} from "lucide-react";
import { handleAdminGetUsers, handleAdminDeleteUser } from "@/lib/actions/auth-action";
import { toast } from "sonner";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await handleAdminGetUsers();
      if (result.success) {
        setUsers(result.users || []);
      }
    } catch (err) {
      toast.error("Registry_Sync_Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onDelete = async (userId: string) => {
    // Verified: Terminology updated to "Delete" as requested
    if (confirm("IDENTITY_DELETION_CONFIRM: Permanent removal of identity? This action cannot be undone.")) {
      const result = await handleAdminDeleteUser(userId);
      if (result.success) {
        toast.success("Identity_Deleted_From_Registry");
        fetchUsers(); 
      } else {
        toast.error(result.message);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Peer_Registry
          </h2>
          <p className="text-zinc-500 font-mono text-[10px] uppercase mt-1">
            Total Authorized Operators: <span className="text-[#D4FF33] font-bold">{users.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4FF33]" size={14} />
            <input 
              type="text"
              placeholder="Search_Identity..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-[#D4FF33]/50 transition-all text-white placeholder:text-zinc-700"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={fetchUsers}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-[#D4FF33] transition-all"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={() => router.push("/admin/users/create")}
            className="flex items-center gap-2 bg-[#D4FF33] text-black px-4 py-2.5 rounded-xl font-black text-[10px] uppercase hover:shadow-[0_0_20px_#D4FF33] transition-all"
          >
            <UserPlus size={14} />
            Authorize_New_Peer
          </button>
        </div>
      </header>

      {/* --- TABLE AREA --- */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-5 text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Identity_Biometrics</th>
              <th className="p-5 text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Access_Level</th>
              <th className="p-5 text-[10px] font-mono uppercase text-zinc-500 tracking-widest text-center">Status</th>
              <th className="p-5 text-[10px] font-mono uppercase text-zinc-500 text-right tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <Loader2 className="mx-auto text-[#D4FF33] animate-spin" size={24} />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center font-mono text-xs text-zinc-600 italic">
                  NO_MATCHING_IDENTITIES_FOUND
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                        <img 
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=111&color=D4FF33&bold=true`} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-none">{user.fullName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono uppercase border ${
                      user.role === 'admin' ? 'border-[#D4FF33]/20 bg-[#D4FF33]/5 text-[#D4FF33]' : 'border-white/10 bg-white/5 text-zinc-400'
                    }`}>
                      {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                      {user.role}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="flex items-center justify-center gap-2 text-[9px] font-mono text-zinc-400 uppercase">
                      <span className="w-1 h-1 rounded-full bg-[#D4FF33] shadow-[0_0_8px_#D4FF33] animate-pulse" />
                      Authorized
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/admin/users/${user._id}/edit`)}
                        className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-[#D4FF33] transition-all flex items-center gap-1.5"
                      >
                        <Edit3 size={14} />
                        <span className="text-[9px] font-bold uppercase hidden sm:block">Edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(user._id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-all flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        <span className="text-[9px] font-bold uppercase hidden sm:block">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}