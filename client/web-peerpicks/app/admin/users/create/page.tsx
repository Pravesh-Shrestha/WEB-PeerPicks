"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function CreateUser() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (file) formData.append("profilePicture", file);

    try {
      await axiosInstance.post(API.ADMIN.USERS, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push("/admin/users");
    } catch (err) {
      console.error("Registration failed");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black text-white uppercase italic mb-8">Register New Peer</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10">
        <input name="fullName" placeholder="FULL NAME" required className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none" />
        <input name="email" type="email" placeholder="EMAIL ADDRESS" required className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none" />
        <input name="password" type="password" placeholder="INITIAL ACCESS KEY" required className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none" />
        <select name="role" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none">
          <option value="user">USER</option>
          <option value="admin">ADMIN</option>
        </select>
        <div className="p-4 border border-dashed border-white/10 rounded-xl bg-black/20">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs text-gray-400" />
        </div>
        <button type="submit" className="w-full bg-[#D4FF33] text-black font-black p-4 rounded-xl uppercase italic">
          Authorize Identity
        </button>
      </form>
    </div>
  );
}