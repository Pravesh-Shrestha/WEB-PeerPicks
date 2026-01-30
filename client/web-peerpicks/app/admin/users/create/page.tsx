"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function CreateUser() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      // Create a local URL for the selected file to show an immediate preview
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    if (file) formData.append("profilePicture", file);

    try {
      await axiosInstance.post(API.ADMIN.USERS, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      console.error("Registration failed");
      alert("CRITICAL ERROR: Failed to authorize new identity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <button 
            onClick={() => router.back()}
            className="text-[#D4FF33] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            ← Back to Database
          </button>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Register New Peer
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-1">PROTOCOL: NEW_IDENTITY_INITIALIZATION</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
           <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
           <p className="text-[#D4FF33] text-xs font-black italic">UPLINK_READY</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Biometrics (Avatar) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative group shadow-2xl">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-700 text-6xl font-black font-mono">?</span>
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">No Biometrics</span>
              </div>
            )}
            <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-[#D4FF33]">
              <span className="text-lg">📷</span>
              <span className="text-[10px] font-bold uppercase italic mt-2">Upload Biometrics</span>
              <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
            </label>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Access Level</label>
            <select 
              name="role" 
              className="w-full bg-black border border-white/10 p-3 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold appearance-none cursor-pointer mt-1"
            >
              <option value="user">USER (Level 1)</option>
              <option value="admin">ADMIN (Root)</option>
            </select>
          </div>
        </div>

        {/* Right Column: Identity Details */}
        <div className="lg:col-span-8 space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Full Name</label>
              <input 
                name="fullName" 
                placeholder="Ex: John Doe"
                required 
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none transition-all font-bold placeholder:text-gray-800" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Gender</label>
              <select name="gender" className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none font-bold appearance-none">
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
              type="email"
              placeholder="peer@network.com"
              required 
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none transition-all font-bold placeholder:text-gray-800" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Initial Access Key (Password)</label>
            <input 
              name="password" 
              type="password"
              placeholder="••••••••"
              required 
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33] outline-none transition-all font-bold placeholder:text-gray-800" 
            />
          </div>

          <div className="pt-6 border-t border-white/5">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#D4FF33] disabled:bg-gray-700 text-black font-black p-5 rounded-2xl uppercase italic hover:bg-white transition-all shadow-[0_0_30px_rgba(212,255,51,0.15)] flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Authorize Identity"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}