"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Next.js 15 unwrapping

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`${API.ADMIN.USERS}/${id}`);
        setUserData(res.data.user || res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Only append if a new file is actually selected
    if (file) formData.append("profilePicture", file);

    try {
      await axiosInstance.put(`${API.ADMIN.USERS}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      alert("Failed to update identity.");
    }
  };

  if (loading) return <div className="p-20 text-white animate-pulse">SYNCHRONIZING...</div>;
  if (!userData) return <div className="p-20 text-red-500">ERROR: IDENTITY NOT FOUND</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black text-white uppercase italic mb-8">Edit: {userData.fullName}</h1>
      
      <form onSubmit={handleUpdate} className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10">
        <input name="fullName" defaultValue={userData.fullName} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white" />
        <input name="email" defaultValue={userData.email} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white" />
        
        {/* Placeholder for missing profile picture */}
        <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-dashed border-white/10">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xs text-gray-500">
            {userData.profilePicture ? "IMG" : "N/A"}
          </div>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs text-gray-400" />
        </div>

        <button type="submit" className="w-full bg-[#D4FF33] text-black font-black p-4 rounded-xl uppercase italic">
          Push Changes
        </button>
      </form>
    </div>
  );
}