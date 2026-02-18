"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MediaSlider({ urls }: { urls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % urls.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);

  return (
    <div className="relative group aspect-square bg-black overflow-hidden">
      <div 
        className="flex h-full transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {urls.map((url, i) => (
          <div key={i} className="min-w-full h-full flex items-center justify-center">
            {url.match(/\.(mp4|mov|webm)$/i) ? (
              <video src={url} controls className="max-h-full w-full object-contain" />
            ) : (
              <img src={url} className="w-full h-full object-cover" alt="Review content" />
            )}
          </div>
        ))}
      </div>

      {urls.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {urls.map((_, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}