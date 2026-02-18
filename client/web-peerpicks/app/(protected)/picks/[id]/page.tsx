"use client";

import React from 'react';
import { MapPin, Star, Phone, Globe, Clock, ChevronLeft, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PickDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // In a real app, fetch your pick data here using the params.id

  return (
    <div className="min-h-screen bg-[#FDFDF5] text-black font-sans flex flex-col">
      {/* Header Image Gallery */}
      <div className="relative h-[45vh] w-full bg-zinc-200">
        <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {/* Map through all images the user uploaded */}
          <div className="min-w-full h-full snap-start border-r border-white/20">
            <img src="/your-image-1.jpg" className="w-full h-full object-cover" alt="Gallery 1" />
          </div>
          <div className="min-w-full h-full snap-start border-r border-white/20">
            <img src="/your-image-2.jpg" className="w-full h-full object-cover" alt="Gallery 2" />
          </div>
        </div>

        {/* Overlay Controls */}
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
        >
          <ChevronLeft size={20} />
        </button>
        <button className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
          <Heart size={20} />
        </button>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto w-full px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: About & Review */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">The Sound Lounge</h1>
            <p className="text-gray-500 font-medium mb-6">Entertainment • Live Music Venue</p>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="flex text-[#D4FF33]"><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/><Star fill="currentColor" size={20}/></div>
              <span className="text-2xl font-black">4.7</span>
              <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Based on 156 reviews</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-black uppercase tracking-widest text-xs text-gray-400">About</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Intimate venue featuring local and touring artists. Enjoy craft cocktails while experiencing live music in a sophisticated setting.
              </p>
            </div>

            <button className="mt-10 w-full py-4 bg-[#D4FF33] text-black font-black uppercase italic rounded-2xl shadow-xl hover:scale-[1.01] transition active:scale-95 flex items-center justify-center gap-2">
              <span>+</span> Write a Review
            </button>
          </div>
        </div>

        {/* Right: Contact Card (The Side-Panel look) */}
        <div className="space-y-6">
          <div className="bg-[#E9EDE5] p-8 rounded-[32px] space-y-8">
            <h4 className="font-black uppercase tracking-tighter text-sm">Contact Info</h4>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="text-gray-600 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Address</p>
                  <p className="text-sm font-bold">Durbar Marg, Kathmandu</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="text-gray-600 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Phone</p>
                  <p className="text-sm font-bold">(555) 123-4567</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Globe className="text-gray-600 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Website</p>
                  <p className="text-sm font-bold underline cursor-pointer text-[#5D44F8]">Visit website</p>
                </div>
              </div>

              <hr className="border-gray-300" />

              <div>
                <h4 className="font-black uppercase tracking-tighter text-sm mb-4">Hours</h4>
                <div className="flex gap-4">
                  <Clock className="text-gray-600 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase">Open today</p>
                    <p className="text-sm font-bold">9:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-[#D4FF33] text-black font-black uppercase italic rounded-2xl shadow-lg">
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}