"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Star, Users } from 'lucide-react'; // These are safe
import Image from 'next/image';
import logo1 from "@/public/logo1.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0F0F12] flex items-center justify-center p-4 overflow-hidden touch-none">
      <div className="relative z-10 w-full max-w-[1000px] h-full max-h-[580px] flex bg-[#1A1A1E] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[40%] relative overflow-hidden bg-gradient-to-br from-[#1c1c24] via-[#1a1625] to-[#121218] p-10 flex-col border-r border-white/5">
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-8">
               <Image src={logo1} alt="PeerPicks" width={100} height={32} className="brightness-200 mb-6" />
               <h1 className="text-2xl font-bold text-white leading-tight mb-3">
                Decide with <span className="text-indigo-400">Confidence.</span>
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed">
                PeerPicks centralizes community reviews for local establishments.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Map size={16} /></div>
                <p className="text-white text-xs font-medium">Local Discoveries</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Star size={16} /></div>
                <p className="text-white text-xs font-medium">Verified Community Ratings</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Users size={16} /></div>
                <p className="text-white text-xs font-medium">Peer-to-Peer Feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col justify-center bg-[#1A1A1E] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-8 md:px-16 lg:px-20"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}