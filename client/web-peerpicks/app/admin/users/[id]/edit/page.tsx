"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api/endpoints";
// IMPORT YOUR SERVER ACTIONS
import { handleAdminGetUserById, handleAdminUpdateUser } from "@/lib/actions/auth-action"; 
import {
  Loader2,
  ArrowLeft,
  ShieldAlert,
  Calendar,
  Smartphone,
  User2,
} from "lucide-react";
import { toast } from "sonner";

export default function EditUser({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "male",
    dob: "",
    role: "user",
  });

  const [identityMeta, setIdentityMeta] = useState({
    email: "",
  });

  useEffect(() => {
    if (!id || id === "undefined" || id === "[id]") return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // EXECUTE SERVER ACTION PROTOCOL
        const result = await handleAdminGetUserById(id);

        if (!result || !result.success) {
          throw new Error(result?.message || "EMPTY_PACKET_RECEIVED");
        }

        const fetchedUser = result.data;

        if (fetchedUser) {
          setFormData({
            fullName: fetchedUser.fullName || fetchedUser.name || "",
            phone: fetchedUser.phone || fetchedUser.phoneNumber || "",
            gender: fetchedUser.gender || "male",
            dob: fetchedUser.dob 
              ? new Date(fetchedUser.dob).toISOString().split("T")[0] 
              : "",
            role: fetchedUser.role || "user",
          });

          setIdentityMeta({
            email: fetchedUser.email || "N/A",
          });

          if (fetchedUser.profilePicture) {
            const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
            const picPath = fetchedUser.profilePicture.startsWith('/') 
              ? fetchedUser.profilePicture 
              : `/${fetchedUser.profilePicture}`;
            setPreview(`${baseUrl}${picPath}`);
          }
        }
      } catch (err: any) {
        console.error("IDENTITY_DECRYPTION_FAILED:", err);
        toast.error(err.message || "DATABASE_OFFLINE");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSyncing(true);

    try {
      // CONVERT STATE TO FORMDATA FOR SERVER ACTION COMPATIBILITY
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submissionData.append(key, value);
      });

      const result = await handleAdminUpdateUser(id, submissionData);

      if (result.success) {
        toast.success("IDENTITY_SYNCHRONIZED_SUCCESSFULLY");
        setTimeout(() => {
          router.push("/admin/users");
          router.refresh();
        }, 1500);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "SYNCHRONIZATION_PROTOCOL_FAILED");
      setIsSyncing(false);
    }
  };

  // ... (Keep the same JSX for Loading and Form)
  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="text-[#D4FF33] animate-spin" size={40} />
      <div className="text-[#D4FF33] font-black italic animate-pulse tracking-widest font-mono text-xl">
        &gt; RETRIEVING_PEER_RECORD...
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <button
            onClick={() => router.back()}
            className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 hover:text-[#D4FF33] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Registry
          </button>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
            Modify Identity
          </h1>
          <p className="text-[#D4FF33]/40 font-mono text-[10px] mt-2 tracking-widest uppercase">
            Network_Identity: <span className="text-white/60">{identityMeta.email}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="aspect-square bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-800 text-7xl font-mono font-black italic">?</div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              <p className="text-[8px] text-[#D4FF33] font-bold uppercase tracking-widest">Biometric_Static</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-black ml-1 tracking-widest italic">Access_Protocol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="user">PEER (Level 1)</option>
                <option value="admin">ADMIN (Root)</option>
              </select>
            </div>
            <div className="bg-[#D4FF33]/5 border border-[#D4FF33]/10 p-4 rounded-2xl flex gap-3">
              <ShieldAlert className="text-[#D4FF33] shrink-0" size={16} />
              <p className="text-[9px] text-zinc-400 font-bold uppercase leading-tight">
                Warning: Role modification affects cross-terminal permissions.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-black ml-1 tracking-widest">Legal_Designation</label>
              <div className="relative">
                <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/10 py-4 pl-12 pr-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-black ml-1 tracking-widest">Gender_Class</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold appearance-none"
              >
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
                <option value="other">OTHER</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-black ml-1 tracking-widest">Comm_Line (Phone)</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/10 py-4 pl-12 pr-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-black ml-1 tracking-widest">Date_of_Origin (DOB)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/10 py-4 pl-12 pr-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold color-scheme-dark"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full bg-[#D4FF33] text-black font-black p-5 rounded-2xl uppercase italic hover:scale-[1.01] transition-all disabled:opacity-50 shadow-[0_10px_40px_rgba(212,255,51,0.1)]"
            >
              {isSyncing ? "SYNCHRONIZING..." : "Commit Changes to Registry"}
            </button>
            <p className="text-center text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
              Authorized_Session_ID: {id?.substring(0, 8)}...
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}