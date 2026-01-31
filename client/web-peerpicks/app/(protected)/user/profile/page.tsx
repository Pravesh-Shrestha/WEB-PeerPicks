"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, Mail, ShieldCheck, MapPin, 
  Edit3, Camera, ChevronLeft, Star, Award, 
  CheckCircle2, Loader2, Zap, Fingerprint, 
  TrendingUp, Users, Heart
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration & Auth Guard
  if (!mounted || loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="text-[#D4FF33]" size={40} />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white"
        >
          Accessing Peer Data
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0C10] via-[#1a1d29] to-[#0B0C10] text-white selection:bg-[#D4FF33] selection:text-black pb-20 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-[#5D44F8]/10 rounded-full blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4FF33]/10 rounded-full blur-[120px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="p-4 sm:p-8 flex items-center justify-between max-w-7xl mx-auto relative z-10"
      >
        <motion.button 
          onClick={() => router.push('/dashboard')}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#D4FF33] transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="hidden sm:inline">Return to Network</span>
          <span className="sm:hidden">Back</span>
        </motion.button>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg"
        >
          <Fingerprint size={14} className="text-[#D4FF33]" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            Node ID: {user?.id?.substring(0, 8) || '0000'}
          </span>
        </motion.div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-10">
        
        {/* --- PROFILE HERO CARD --- */}
        <motion.section 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mb-8 sm:mb-12"
        >
          {/* Enhanced Background Glow Effect */}
          <motion.div 
            className="absolute -inset-4 bg-gradient-to-br from-[#5D44F8]/20 via-[#D4FF33]/10 to-[#5D44F8]/20 blur-[100px] rounded-full"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative bg-gradient-to-br from-[#0F1116] to-[#1a1d29] border border-white/10 rounded-3xl sm:rounded-[3.5rem] p-6 sm:p-10 md:p-16 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-[#D4FF33]/5 via-transparent to-[#5D44F8]/5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 relative z-10">
              
              {/* Avatar Visualization */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="relative group/avatar flex-shrink-0"
              >
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-tr from-[#D4FF33] via-[#5D44F8] to-[#D4FF33] rounded-[3.2rem] blur opacity-30"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-gradient-to-br from-[#161920] to-[#0F1116] border-2 border-white/20 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-2xl">
                  {user?.profilePicture ? (
                    <motion.img 
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-[3rem]" 
                    />
                  ) : (
                    <motion.div
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <UserIcon size={70} className="text-gray-800" strokeWidth={1} />
                    </motion.div>
                  )}
                  
                  {/* Enhanced Link to Update */}
                  <Link 
                    href="/user/update-profile" 
                    className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-2 backdrop-blur-sm rounded-[3rem]"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Camera size={24} className="text-[#D4FF33]" />
                    </motion.div>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Change Visuals</span>
                  </Link>
                </div>
              </motion.div>

              {/* Identity & Bio */}
              <div className="flex-1 text-center lg:text-left w-full">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4 sm:mb-6"
                >
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-1.5 bg-gradient-to-r from-[#D4FF33] to-[#b8d928] text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg"
                  >
                    Verified Peer
                  </motion.span>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full text-gray-400 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-[#D4FF33]" />
                      Reputation 98.2
                    </span>
                  </motion.span>
                </motion.div>
                
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mb-4 sm:mb-6 leading-none bg-gradient-to-r from-white via-[#D4FF33] to-white bg-clip-text text-transparent"
                >
                  {user?.fullName || "Peer Member"}
                </motion.h1>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-gray-400"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center gap-2.5 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10"
                  >
                    <Mail size={18} className="text-[#5D44F8]" />
                    <span className="text-[13px] sm:text-[15px] font-medium tracking-tight">{user?.email}</span>
                  </motion.div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center gap-2.5 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10"
                  >
                    <MapPin size={18} className="text-[#D4FF33]" />
                    <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-widest">Global Node</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Edit CTA */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
                className="w-full lg:w-auto"
              >
                <Link 
                  href="/user/update-profile"
                  className="group relative w-full lg:w-auto px-8 sm:px-10 py-5 sm:py-6 bg-gradient-to-r from-white/10 to-white/5 hover:from-[#D4FF33] hover:to-[#b8d928] text-white hover:text-black border border-white/20 hover:border-transparent rounded-2xl sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-xl hover:shadow-[#D4FF33]/40 overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <Edit3 size={18} className="group-hover:rotate-12 transition-transform" /> 
                  <span>Modify Identity</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* --- DATA GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Contribution Metrics */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#0F1116] to-[#1a1d29] border border-white/10 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden group"
            >
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF33]/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 sm:mb-10 flex items-center gap-3 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Award size={18} className="text-[#D4FF33]" />
                </motion.div>
                Network Statistics
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 relative z-10">
                <StatItem label="Reviews" value="128" delay={0.8} />
                <StatItem label="Impact" value="4.2k" delay={0.9} />
                <StatItem label="Trust" value="High" delay={1.0} />
                <StatItem label="Joined" value="2024" delay={1.1} />
              </div>
            </motion.div>

            {/* About / Bio Section */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#0F1116] to-[#1a1d29] border border-white/10 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden group"
            >
              <motion.div 
                className="absolute bottom-0 left-0 w-32 h-32 bg-[#5D44F8]/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: 2 }}
              />
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 sm:mb-6 flex items-center gap-3 relative z-10">
                <Users size={18} className="text-[#5D44F8]" />
                About the Peer
              </h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-gray-400 leading-relaxed text-[14px] sm:text-[15px] font-medium relative z-10"
              >
                Core contributor to the PeerPicks network. Passionate about decentralizing quality consensus and discovering high-value local services. Always verified.
              </motion.p>
            </motion.div>
          </div>

          {/* Achievement Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-[#5D44F8] via-[#4a35c9] to-[#161920] border border-white/20 rounded-2xl sm:rounded-[3rem] p-8 sm:p-10 text-center relative overflow-hidden group shadow-2xl"
            >
              <motion.div 
                className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
                className="w-20 h-20 bg-black/40 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/20 relative z-10 shadow-2xl"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Star size={32} className="text-[#D4FF33] fill-[#D4FF33]" />
                </motion.div>
              </motion.div>
              <h4 className="text-[14px] sm:text-[15px] font-black uppercase italic tracking-widest mb-3 relative z-10">Elite Status</h4>
              <p className="text-[9px] sm:text-[10px] text-white/50 uppercase font-bold tracking-widest leading-relaxed relative z-10">
                Top tier consensus provider in current region
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#0F1116] to-[#1a1d29] border border-white/10 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden"
            >
              <motion.div 
                className="absolute top-0 left-0 w-24 h-24 bg-[#D4FF33]/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-500 mb-6 sm:mb-8 flex items-center gap-2 relative z-10">
                <ShieldCheck size={16} className="text-[#D4FF33]" /> Security
              </h4>
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <VerificationRow icon={CheckCircle2} label="Biometric Sync" active delay={1.2} />
                <VerificationRow icon={CheckCircle2} label="Email Secured" active delay={1.3} />
                <VerificationRow icon={CheckCircle2} label="Ledger Verified" active={false} delay={1.4} />
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatItem({ label, value, delay }: { label: string, value: string, delay: number }) {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", bounce: 0.5 }}
      whileHover={{ scale: 1.1, y: -5 }}
      className="space-y-1 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-[#D4FF33]/30 transition-all duration-300"
    >
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">{label}</p>
      <motion.p 
        className="text-2xl font-black italic uppercase text-white tracking-tighter"
        animate={{ 
          color: ["#ffffff", "#D4FF33", "#ffffff"]
        }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

function VerificationRow({ icon: Icon, label, active, delay }: { icon: any, label: string, active: boolean, delay: number }) {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: active ? 1 : 0.3 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ x: 5, scale: 1.02 }}
      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${active ? 'bg-white/5 hover:bg-white/10' : ''}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={active ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0, -5, 0]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon size={16} className={active ? 'text-[#D4FF33]' : 'text-gray-600'} />
        </motion.div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {active && (
        <motion.span 
          className="w-2 h-2 rounded-full bg-[#D4FF33]"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}