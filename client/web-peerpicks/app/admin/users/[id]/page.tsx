"use client";
import React, { useEffect, useState, use } from "react"; // 1. Import 'use'

export default function ViewUser({ params }: { params: Promise<{ id: string }> }) {
    // 2. Unwrap the params promise
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(data => setUser(data.user));
    }, [id]); // 3. Use the unwrapped id here

    if (!user) return <div className="p-20 text-center text-white/20 uppercase tracking-widest">Scanning...</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 p-10 rounded-3xl">
            <h1 className="text-5xl font-black text-white uppercase italic">{user.fullName}</h1>
            <p className="text-[#D4FF33] font-mono">ID: {id}</p>
        </div>
    );
}