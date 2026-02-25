"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Loader2,
  User as UserIcon,
  Calendar,
  Phone,
  Fingerprint,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
// Use the Server Action for profile updates
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { toast } from "sonner";

export default function UpdateProfilePage() {
  const { user, checkAuth, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State initialized with empty strings to avoid uncontrolled/controlled input warnings
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when user data is fetched from AuthContext
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || "");
      setGender((user.gender as "male" | "female") || "male");
      setPhone(user.phone || user.phoneNumber || ""); // Fetching the number here
      
      // Handle Profile Picture Preview with backend URL normalization
      if (user.profilePicture) {
        const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
        const picPath = user.profilePicture.startsWith('/') 
          ? user.profilePicture 
          : `/${user.profilePicture}`;
        setPreviewImage(`${baseUrl}${picPath}`);
      }

      // Format Date for HTML input[type="date"] (YYYY-MM-DD)
      if (user.dob) {
        try {
          setDob(new Date(user.dob).toISOString().split("T")[0]);
        } catch (e) {
          console.error("Date parsing error", e);
        }
      }
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("FILE_TOO_LARGE: Max 5MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("gender", gender);
      formData.append("phone", phone);
      formData.append("dob", dob);
      if (selectedFile) formData.append("profilePicture", selectedFile);

      // Execute Server Action - this handles the PUT and cookie updates
      const result = await handleUpdateProfile(formData);

      if (result.success) {
        toast.success("IDENTITY_SYNCHRONIZED");
        // Re-sync local AuthContext to reflect new data immediately
        await checkAuth();
        setTimeout(() => router.push("/user/profile"), 1500);
      } else {
        throw new Error(result.message || "SYNC_PROTOCOL_FAILED");
      }
    } catch (err: any) {
      toast.error(err.message || "NETWORK_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || authLoading) return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
      <Loader2 className="text-[#D4FF33] animate-spin" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white selection:bg-[#D4FF33] selection:text-black">
      <nav className="p-6 flex items-center justify-between border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-[#D4FF33] transition-all"
        >
          <ChevronLeft size={16} />
          <span>Discard</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
          <Fingerprint size={14} className="text-[#D4FF33]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
            SECURE_PROFILE_MOD
          </span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            Update{" "}
            <span className="bg-gradient-to-r from-[#D4FF33] to-[#5D44F8] bg-clip-text text-transparent">
              Node
            </span>
          </h1>
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em]">
            Identity Session: <span className="text-white/60">{user?.email}</span>
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AVATAR SECTION */}
          <div className="flex flex-col items-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#0F1116] border-2 border-white/10 group-hover:border-[#D4FF33]/50 overflow-hidden transition-all duration-500 flex items-center justify-center shadow-2xl">
                {previewImage ? (
                  <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-gray-700" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Upload size={24} className="text-[#D4FF33]" />
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <span className="mt-4 text-[9px] font-black uppercase tracking-widest text-gray-600">Visual_Static_Upload</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              icon={UserIcon}
              value={fullName}
              onChange={(e: any) => setFullName(e.target.value)}
              placeholder="PEER_NAME"
            />

            <InputField
              label="Contact Phone"
              icon={Phone}
              value={phone}
              onChange={(e: any) => setPhone(e.target.value)}
              placeholder="+00 000 000 000"
            />

            <InputField
              label="Birth Date"
              icon={Calendar}
              type="date"
              value={dob}
              onChange={(e: any) => setDob(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-4">Gender Identification</label>
              <div className="flex gap-2">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      gender === g
                        ? "bg-[#D4FF33] border-[#D4FF33] text-black"
                        : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-[#D4FF33] text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(212,255,51,0.15)] hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{isSubmitting ? "Syncing Identity..." : "Commit Changes"}</span>
          </button>
        </form>
      </main>
    </div>
  );
}

function InputField({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-4">{label}</label>
      <div className="relative group">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4FF33] transition-all" />
        <input
          {...props}
          className="w-full bg-white/5 border border-white/10 focus:border-[#D4FF33]/50 outline-none rounded-xl py-3.5 pl-12 pr-4 text-[11px] font-bold transition-all color-scheme-dark"
        />
      </div>
    </div>
  );
}