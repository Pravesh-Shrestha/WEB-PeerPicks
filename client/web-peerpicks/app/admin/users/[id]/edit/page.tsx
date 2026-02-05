"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { Fingerprint } from "lucide-react";

export default function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    role: "user",
    password: "", 
  });

  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`${API.ADMIN.USERS}/${id}`);
        const fetchedUser = res.data.user || res.data.data || res.data;

        if (fetchedUser) {
          setFormData({
            fullName: fetchedUser.fullName || "",
            email: fetchedUser.email || "",
            phone: fetchedUser.phone || "",
            gender: fetchedUser.gender || "male",
            role: fetchedUser.role || "user",
            password: "", 
          });

          if (fetchedUser.profilePicture) {
            const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
            const picPath = fetchedUser.profilePicture.startsWith('/') 
              ? fetchedUser.profilePicture 
              : `/${fetchedUser.profilePicture}`;
            
            const fullUrl = `${baseUrl}${picPath}?t=${new Date().getTime()}`;
            setPreview(fullUrl);
          }
        }
      } catch (err) {
        console.error("IDENTITY_DECRYPTION_FAILED:", err);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSyncing(true);
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("gender", formData.gender);
    data.append("role", formData.role);

    if (formData.password.trim() !== "") {
      data.append("password", formData.password);
    }

    if (file) data.append("profilePicture", file);

    try {
      await axiosInstance.put(`${API.ADMIN.USERS}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setShowToast(true);
      
      setTimeout(() => {
        router.push("/admin/users");
        router.refresh();
      }, 2000);

    } catch (err) {
      console.error("SYNCHRONIZATION_ERROR:", err);
      alert("CRITICAL ERROR: Failed to synchronize identity updates.");
      setIsSyncing(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-[#D4FF33] font-black italic animate-pulse tracking-widest text-2xl font-mono">
        &gt; DECRYPTING_PEER_DATA...
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      {/* SUCCESS TOAST */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-[#D4FF33] text-black px-8 py-4 rounded-2xl font-black italic shadow-[0_0_50px_rgba(212,255,51,0.4)] flex items-center gap-3 border-2 border-white animate-in fade-in zoom-in duration-300">
          <span className="text-xl">✓</span> IDENTITY_SYNCHRONIZED_SUCCESSFULLY
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <button
            onClick={() => router.back()}
            className="text-[#D4FF33] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            ← Back to Database
          </button>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Modify Identity
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-1">UUID: {id}</p>
        </div>

        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
          <p className="text-[10px] text-gray-500 uppercase font-bold">
            Status
          </p>
          <p className="text-[#D4FF33] text-xs font-black italic animate-pulse">
            CONNECTED // EDIT_MODE
          </p>
        </div>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative group shadow-2xl">
            {preview ? (
              <img
                key={preview}
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover block"
              />
            ) : (
              <div className="text-gray-800 text-6xl font-black font-mono">
                ?
              </div>
            )}
            <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-[#D4FF33] backdrop-blur-sm">
              <span className="text-3xl">📸</span>
              <span className="text-[10px] font-bold uppercase italic mt-2 tracking-widest">
                Update Biometrics
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">
                Access Level
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold appearance-none cursor-pointer transition-colors"
                >
                  <option value="user">USER (Level 1)</option>
                  <option value="admin">ADMIN (Root)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            {/* RESTORED SECURITY NOTICE */}
            <div className="bg-[#D4FF33]/5 border border-[#D4FF33]/10 p-4 rounded-2xl">
              <p className="text-[9px] text-[#D4FF33] font-bold uppercase leading-tight">
                ⚠️ Security Notice: Role escalation grants Root-level privileges
                to the system terminal.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <div className="lg:col-span-8 space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">
                Legal Designation (Full Name)
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">
                Gender Class
              </label>
              <div className="relative">
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">
              Network Identity (Email)
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">
              Communication Line (Phone)
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold transition-all"
            />
          </div>

          {/* PASSWORD OVERRIDE - IDENTITY HUB DESIGN */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1 flex justify-between items-center tracking-widest">
              <span>Security Override</span>
              <span className="text-[#D4FF33]/60 italic lowercase font-medium bg-[#D4FF33]/5 px-2 py-0.5 rounded-md">
                leave blank to retain hash
              </span>
            </label>

            <div className="relative group">
              <Fingerprint
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#D4FF33] transition-colors"
                size={18}
              />
              <input
                type="password"
                name="password"
                placeholder="NEW_ENCRYPTION_KEY..."
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-[#0A0A0A] border border-white/10 py-3.5 pl-12 pr-4 rounded-xl text-sm text-white focus:border-[#D4FF33]/50 focus:ring-1 focus:ring-[#D4FF33]/20 outline-none font-bold placeholder:text-gray-800 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full bg-[#D4FF33] text-black font-black p-5 rounded-2xl uppercase italic hover:bg-white transition-all shadow-[0_0_30px_rgba(212,255,51,0.15)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSyncing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-xl">◌</span>{" "}
                  SYNCHRONIZING_CORE...
                </span>
              ) : (
                "Push Updates to Terminal"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full p-4 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Terminate Session (Discard Changes)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}