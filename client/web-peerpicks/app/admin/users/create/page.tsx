"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, Upload, Shield, Mail, Phone, Lock, 
  User, Camera, ArrowLeft, CheckCircle2, Loader2,
  AlertCircle, Eye, EyeOff, Zap, Users,
  ChevronDown,
  Calendar
} from "lucide-react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function CreateUser() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dob: "",
    role: "user"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clean up the memory when the component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = new FormData(e.currentTarget);
    // if (file) submitData.append("profilePicture", file);

    try {
      await axiosInstance.post(API.ADMIN.USERS, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      console.error("Registration failed:", err);
      alert("CRITICAL ERROR: Failed to authorize new identity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4FF33]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 relative">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#5D44F8]/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, 30, 0],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#D4FF33]/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1.15, 1, 1.15],
            x: [0, -20, 0],
            y: [0, -30, 0],
            opacity: [0.4, 0.3, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10"
      >
        <div>
          <motion.button 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="text-[#D4FF33] text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2 hover:opacity-70 transition-all"
          >
            <ArrowLeft size={14} />
            Back to Database
          </motion.button>
          
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
              className="p-2.5 bg-gradient-to-br from-[#5D44F8] to-[#4a35c9] rounded-xl shadow-xl"
            >
              <UserPlus size={24} className="text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tighter">
              Register New Peer
            </h1>
          </div>
          <p className="text-gray-500 text-[10px] sm:text-xs font-mono uppercase tracking-wider flex items-center gap-2">
            <Zap size={12} className="text-[#D4FF33]" />
            Protocol: NEW_IDENTITY_INITIALIZATION
          </p>
        </div>
        
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 px-5 py-3 rounded-xl backdrop-blur-xl shadow-xl"
        >
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#D4FF33]"
            />
            <p className="text-[#D4FF33] text-xs font-black italic uppercase">Uplink Ready</p>
          </div>
        </motion.div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10">
        {/* Left Column: Biometrics */}
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-4 space-y-5"
        >
          {/* Image Upload */}
          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="aspect-square bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative shadow-2xl backdrop-blur-xl"
            >
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.img 
                    key="preview"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <User size={64} className="text-gray-700" strokeWidth={1} />
                    </motion.div>
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">No Biometrics</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <label className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Camera size={32} className="text-[#D4FF33]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">Upload Biometrics</span>
                </motion.div>
                <input type="file" name="profilePicture" onChange={handleFileChange} className="hidden" accept="image/*" />
              </label>
            </motion.div>

            {file && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-[#D4FF33] rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle2 size={18} className="text-black" />
              </motion.div>
            )}
          </div>

          {/* Access Level */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-xl"
          >
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-3 flex items-center gap-2">
              <Shield size={12} className="text-[#5D44F8]" />
              Access Level
            </label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 p-3.5 rounded-xl text-white focus:border-[#D4FF33]/50 outline-none font-bold appearance-none cursor-pointer transition-all duration-200"
            >
              <option value="user" className="bg-[#1a1d29]">USER (Level 1)</option>
              <option value="admin" className="bg-[#1a1d29]">ADMIN (Root)</option>
            </select>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="bg-gradient-to-br from-[#5D44F8]/10 to-[#5D44F8]/5 border border-[#5D44F8]/30 p-4 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-[#5D44F8] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-[#5D44F8] uppercase tracking-wider mb-1">Security Notice</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  All credentials are encrypted and stored securely in the network database.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Identity Details */}
        <motion.div 
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-8 space-y-5 bg-gradient-to-br from-white/5 to-white/10 p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl"
        >
          <div className="space-y-5">
            {/* Full Name */}
            <InputField
              label="Full Name"
              name="fullName"
              icon={User}
              placeholder="Ex: John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              delay={0.35}
            />

            {/* Gender & DOB Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender Selection */}
              <div className="space-y-2">
                <motion.label 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="text-[10px] text-gray-500 uppercase font-black tracking-wider ml-1 flex items-center gap-2"
                >
                  <Users size={12} className="text-[#5D44F8]" />
                  Gender
                </motion.label>
                <div className="relative group">
                  <motion.select 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33]/50 outline-none font-bold appearance-none transition-all duration-200 cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#1a1d29] text-gray-500">Select Gender</option>
                    <option value="male" className="bg-[#1a1d29]">Male</option>
                    <option value="female" className="bg-[#1a1d29]">Female</option>
                  </motion.select>
                  {/* Custom Chevron for the Select */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-[#D4FF33] transition-colors">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
              
              {/* Date of Birth Field */}
              <div className="space-y-2">
                <motion.label 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="text-[10px] text-gray-500 uppercase font-black tracking-wider ml-1 flex items-center gap-2"
                >
                  <Calendar size={12} className="text-[#5D44F8]" />
                  Date of Birth
                </motion.label>
                <motion.input 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.3 }}
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33]/50 outline-none font-bold transition-all duration-200 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Email */}
            <InputField
              label="Network Identity (Email)"
              name="email"
              type="email"
              icon={Mail}
              placeholder="peer@network.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              delay={0.6}
            />

            {/* Phone */}
            <InputField
              label="Communication Line (Phone)"
              name="phone"
              icon={Phone}
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={handleInputChange}
              required
              delay={0.65}
            />

            {/* Password */}
            <div className="space-y-2">
              <motion.label 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                className="text-[10px] text-gray-500 uppercase font-black tracking-wider ml-1 flex items-center gap-2"
              >
                <Lock size={12} className="text-[#5D44F8]" />
                Initial Access Key (Password)
              </motion.label>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.3 }}
                className="relative"
              >
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                  className="w-full bg-black/50 border border-white/10 p-4 pr-12 rounded-xl text-white focus:border-[#D4FF33]/50 outline-none transition-all duration-200 font-bold placeholder:text-gray-800" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4FF33] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="pt-6 border-t border-white/10"
          >
            <motion.button 
              type="submit" 
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="group relative w-full bg-gradient-to-r from-[#D4FF33] to-[#b8d928] hover:from-[#b8d928] hover:to-[#D4FF33] disabled:from-gray-800 disabled:to-gray-900 text-black disabled:text-gray-600 font-black p-5 rounded-2xl uppercase italic shadow-[0_0_30px_rgba(212,255,51,0.2)] transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={isSubmitting ? { x: ["0%", "100%"] } : {}}
                transition={{ duration: 1.5, repeat: isSubmitting ? Infinity : 0, ease: "linear" }}
              />
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={20} />
                  </motion.div>
                  <span className="relative z-10">Initializing...</span>
                </>
              ) : (
                <>
                  <Shield size={20} className="relative z-10" />
                  <span className="relative z-10">Authorize Identity</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}

function InputField({ 
  label, 
  name, 
  icon: Icon, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  type = "text",
  delay = 0 
}: any) {
  return (
    <div className="space-y-2">
      <motion.label 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="text-[10px] text-gray-500 uppercase font-black tracking-wider ml-1 flex items-center gap-2"
      >
        <Icon size={12} className="text-[#5D44F8]" />
        {label}
      </motion.label>
      <motion.input 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.05, duration: 0.3 }}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-[#D4FF33]/50 outline-none transition-all duration-200 font-bold placeholder:text-gray-800" 
      />
    </div>
  );
}