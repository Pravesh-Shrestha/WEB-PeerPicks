"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, ChevronLeft, Save, Loader2, 
  User as UserIcon, Calendar, ShieldCheck, AlertCircle, 
  CheckCircle2, RefreshCcw, Fingerprint, Sparkles, Upload
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { API } from '@/lib/api/endpoints';
import { setUserData } from '@/lib/cookie';

export default function UpdateProfilePage() {
  const { user, checkAuth, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(""); 
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{type: 'error' | 'success', msg: string} | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      if (user.dob) {
        // Ensure date is formatted correctly for HTML input (YYYY-MM-DD)
        const date = new Date(user.dob).toISOString().split('T')[0];
        setDob(date);
      }
      setPreviewImage(user.profilePicture || null);
    }
  }, [user]);

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', msg: "File too large. Max 5MB." });
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
    setStatus(null);

    try {
      // 1. Extract the token using your specific cookie name 'auth_token'
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const token = getCookie('auth_token');

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('dob', dob);
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      // 2. Perform the PUT request
      const response = await fetch(API.AUTH.UPDATEPROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Browser automatically sets Content-Type for FormData
        },
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || "Update failed");

      // 3. REFRESH LOCAL COOKIES & STATE
      // Ensure your backend returns the updated user object as 'result.user'
      if (result.user) {
        // Update the 'user_data' cookie via your Server Action
        await setUserData(result.user);
      }

      setStatus({ type: 'success', msg: "Identity synchronized" });

      // Trigger Context refresh to update global UI state
      await checkAuth(); 
      
      // Force Next.js to refresh server components and clear client cache
      router.refresh();

      // 4. Redirect after brief success message
      setTimeout(() => router.push('/user/profile'), 1200);
      
    } catch (err: any) {
      console.error("Update Error:", err);
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || authLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10] text-white selection:bg-[#D4FF33] selection:text-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-64 h-64 bg-[#5D44F8]/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-64 h-64 bg-[#D4FF33]/10 rounded-full blur-[100px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.2, 0.4],
            x: [0, -20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="p-4 sm:p-6 md:p-8 flex items-center justify-between border-b border-white/10 backdrop-blur-xl relative z-10"
      >
        <motion.button
          onClick={() => router.back()}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-[#D4FF33] transition-all group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back</span>
        </motion.button>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
        >
          <Fingerprint size={16} className="text-[#D4FF33]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
            NODE_AUTH_V3
          </span>
        </motion.div>
      </motion.nav>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 sm:mb-8 text-center sm:text-left"
        >
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={18} className="text-[#D4FF33]" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">
              Edit{" "}
              <span className="bg-gradient-to-r from-[#D4FF33] to-[#5D44F8] bg-clip-text text-transparent">
                Credentials
              </span>
            </h1>
          </div>
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em]">
            Modify peer identification details
          </p>
        </motion.header>

        <motion.form
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6"
        >
          {/* IMAGE UPLOAD */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex flex-col items-center p-6 sm:p-7 bg-gradient-to-br from-[#0F1116] to-[#1a1d29] rounded-2xl sm:rounded-3xl border border-white/10 group hover:border-[#D4FF33]/30 transition-all duration-500 shadow-xl backdrop-blur-xl relative overflow-hidden"
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute top-0 right-0 w-24 h-24 bg-[#D4FF33]/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer group/avatar z-10"
              onClick={() => fileInputRef.current?.click()}
            >
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-[#D4FF33] via-[#5D44F8] to-[#D4FF33] rounded-[2.2rem] blur opacity-20"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-br from-[#0B0C10] to-[#161920] border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-2xl">
                {previewImage ? (
                  <motion.img
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    // REMOVE the http://localhost:3000 prefix
                    src={
                      previewImage.startsWith("data:")
                        ? previewImage
                        : `${previewImage}`
                    }
                    alt="Preview"
                    className="w-full h-full object-cover rounded-[2rem]"
                  />
                ) : (
                  <motion.div>
                    <UserIcon
                      size={40}
                      className="text-gray-700"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                )}

                <motion.div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-2 backdrop-blur-sm rounded-[2rem]">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Upload size={24} className="text-[#D4FF33]" />
                  </motion.div>
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    Upload New
                  </span>
                </motion.div>
              </div>
            </motion.div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-[9px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-2"
            >
              <Camera size={12} className="text-[#5D44F8]" />
              Visual Identity Node
            </motion.span>

            {selectedFile && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-2 px-3 py-1.5 bg-[#D4FF33]/10 border border-[#D4FF33]/30 rounded-full"
              >
                <span className="text-[8px] font-black uppercase tracking-wider text-[#D4FF33]">
                  New Image Selected
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Input Fields */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4 sm:space-y-5"
          >
            <InputField
              label="Legal Full Name"
              icon={UserIcon}
              type="text"
              value={fullName}
              onChange={(e: any) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              delay={0.5}
            />

            <InputField
              label="Date of Birth"
              icon={Calendar}
              type="date"
              value={dob}
              onChange={(e: any) => setDob(e.target.value)}
              delay={0.6}
            />
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`p-4 rounded-2xl border flex items-center gap-3 shadow-lg backdrop-blur-xl ${
                  status.type === "success"
                    ? "bg-lime-500/10 border-lime-500/30 text-lime-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                <motion.div
                  animate={{
                    rotate:
                      status.type === "success" ? [0, 360] : [0, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                </motion.div>
                <span className="text-[10px] font-black uppercase tracking-widest flex-1">
                  {status.msg}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="group relative w-full py-4 bg-gradient-to-r from-[#D4FF33] to-[#b8d928] hover:from-[#b8d928] hover:to-[#D4FF33] disabled:from-gray-800 disabled:to-gray-900 disabled:cursor-not-allowed text-black disabled:text-gray-600 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:shadow-[#D4FF33]/40 transition-all overflow-hidden"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: isSubmitting ? ["0%", "100%"] : "0%" }}
              transition={{
                duration: 1.5,
                repeat: isSubmitting ? Infinity : 0,
                ease: "linear",
              }}
            />

            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 size={20} />
                </motion.div>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Save
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Sync Identity</span>
              </>
            )}
          </motion.button>
        </motion.form>
      </main>
    </div>
  );
}

function InputField({ label, icon: Icon, delay = 0, ...props }: any) {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="space-y-2"
    >
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-4 flex items-center gap-2">
        <ShieldCheck size={11} className="text-[#5D44F8]" />
        {label}
      </label>
      <motion.div 
        whileFocus={{ scale: 1.005 }}
        className="relative group"
      >
        <motion.div 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4FF33] transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon size={16} />
        </motion.div>
        
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4FF33]/20 to-[#5D44F8]/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"
        />
        
        <input 
          {...props}
          className="relative w-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10 focus:border-[#D4FF33]/50 outline-none rounded-xl py-3.5 pl-12 pr-4 text-[13px] transition-all duration-300 color-scheme-dark backdrop-blur-xl shadow-lg focus:shadow-[#D4FF33]/20"
        />
      </motion.div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="h-screen bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#5D44F8]/5 to-[#D4FF33]/5"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <RefreshCcw className="text-[#D4FF33]" size={32} />
      </motion.div>
      
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[10px] font-black uppercase tracking-widest text-gray-500"
      >
        Decrypting Profile...
      </motion.span>
      
      {/* Loading dots */}
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-[#D4FF33] rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}