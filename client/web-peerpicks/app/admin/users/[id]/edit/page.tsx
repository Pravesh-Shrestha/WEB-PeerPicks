"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    role: "user",
  });

  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`${API.ADMIN.USERS}/${id}`);
        
        // Match the 'data' key from your AdminController
        const fetchedUser = res.data.data || res.data.user || res.data;

        if (fetchedUser) {
          setFormData({
            fullName: fetchedUser.fullName || "",
            email: fetchedUser.email || "",
            phone: fetchedUser.phone || "",
            gender: fetchedUser.gender || "male",
            role: fetchedUser.role || "user",
          });

          if (fetchedUser.profilePicture) {
            const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
            const picPath = fetchedUser.profilePicture.startsWith('/') 
              ? fetchedUser.profilePicture 
              : `/${fetchedUser.profilePicture}`;
            
            // ADDED: Timestamp suffix to bypass browser cache
            const fullUrl = `${baseUrl}${picPath}?t=${new Date().getTime()}`;
            console.log("Constructed Image URL:", fullUrl);
            setPreview(fullUrl);
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
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
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("gender", formData.gender);
    data.append("role", formData.role);
    if (file) data.append("profilePicture", file);

    try {
      await axiosInstance.put(`${API.ADMIN.USERS}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      alert("CRITICAL ERROR: Failed to synchronize identity updates.");
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
    <div className="max-w-4xl mx-auto pb-20">
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
        
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
           <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
           <p className="text-[#D4FF33] text-xs font-black italic">CONNECTED / EDIT_MODE</p>
        </div>
      </div>
      
      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative group shadow-2xl">
            {preview ? (
              <img 
                key={preview} // FORCES RE-RENDER when preview changes
                src={preview} 
                alt="Profile" 
                className="w-full h-full object-cover block" 
                onError={(e) => {
                  console.error("Image load failed, path might be invalid");
                  (e.target as HTMLImageElement).src = ""; // Clear broken src
                }}
              />
            ) : (
              <div className="text-gray-800 text-6xl font-black font-mono">?</div>
            )}
            <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-[#D4FF33]">
              <span className="text-lg">📷</span>
              <span className="text-[10px] font-bold uppercase italic mt-2">Update Biometrics</span>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Access Level</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 p-3 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="user">USER (Level 1)</option>
                <option value="admin">ADMIN (Root)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Full Name</label>
              <input 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none transition-all font-bold" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Network Identity (Email)</label>
            <input 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange}
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none transition-all font-bold" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Communication Line (Phone)</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange}
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none transition-all font-bold" 
            />
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <button 
              type="submit" 
              className="w-full bg-[#D4FF33] text-black font-black p-5 rounded-2xl uppercase italic hover:bg-white transition-all shadow-[0_0_30px_rgba(212,255,51,0.15)]"
            >
              Push Updates to Terminal
            </button>
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full p-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Terminate Session (Discard Changes)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}