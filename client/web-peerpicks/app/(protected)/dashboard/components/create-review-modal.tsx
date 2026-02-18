"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Star, Loader2, Trash2, Plus, Tag } from 'lucide-react';
import { createPick } from '@/lib/actions/pick-actions';

interface Props {
  onClose: () => void;
  refreshFeed: () => void;
}

// Defining the categories you requested
const CATEGORIES = ["RESTAURANT", "CAFE", "HOTEL", "PARK", "LIBRARY", "OTHERS"];

export default function CreateReviewModal({ onClose, refreshFeed }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("OTHERS");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const totalFiles = [...files, ...selectedFiles].slice(0, 5);
    setFiles(totalFiles);
    const newPreviews = totalFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData();

    formData.append("placeInfo", JSON.stringify({
      link: (form.elements.namedItem("googleLink") as HTMLInputElement).value,
      alias: (form.elements.namedItem("alias") as HTMLInputElement).value,
      category: selectedCategory // Now dynamic based on user selection
    }));

    formData.append("reviewInfo", JSON.stringify({
      stars: stars,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      tags: []
    }));

    files.forEach((file) => formData.append("images", file));

    try {
      const res = await createPick(formData);
      if (res.success) {
        refreshFeed();
        onClose();
      }
    } catch (err) {
      console.error("Transmission Error:", err);
      alert("Transmission failed. Ensure files are under 20MB.");
    } finally {
      setLoading(false);
    }
  };

  const displayStars = hoveredStar ?? stars;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4FF33]/5 blur-[120px]" />
      </div>

      <div
        className="relative bg-[#0C0C0E] border border-white/[0.08] w-full max-w-[540px] rounded-[32px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-300 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#D4FF33]/40 to-transparent" />

        {/* ─── HEADER ─── */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF33] animate-pulse" />
              <span className="text-[10px] font-bold text-[#D4FF33]/60 uppercase tracking-[0.25em]">New Pick</span>
            </div>
            <h2 className="text-[28px] font-black text-white italic uppercase tracking-tight leading-none">
              Drop a Pick
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-red-400 transition-all duration-200"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mx-8 h-px bg-white/[0.06]" />

        {/* ─── FORM ─── */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          
          <div className="relative">
            <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4FF33]/50" />
            <input
              name="googleLink"
              required
              placeholder="Paste Google Maps link"
              className="w-full pl-10 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] focus:border-[#D4FF33]/40 rounded-2xl outline-none text-sm text-white placeholder:text-zinc-600 font-medium transition-all duration-200 focus:bg-white/[0.06]"
            />
          </div>

          <input
            name="alias"
            required
            placeholder="Place name or alias"
            className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] focus:border-[#D4FF33]/40 rounded-2xl outline-none text-sm text-white placeholder:text-zinc-600 font-medium transition-all duration-200 focus:bg-white/[0.06]"
          />

          {/* ─── CATEGORY SELECTOR ─── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Tag size={12} className="text-[#D4FF33]/60" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Category</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2.5 rounded-xl text-[9px] font-black transition-all border ${
                    selectedCategory === cat 
                      ? 'bg-[#D4FF33] text-black border-[#D4FF33] shadow-[0_0_15px_rgba(212,255,51,0.2)]' 
                      : 'bg-white/[0.02] text-zinc-500 border-white/[0.05] hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <textarea
            name="description"
            required
            placeholder="What makes this place worth visiting? Give the real take..."
            className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] focus:border-[#D4FF33]/40 rounded-2xl outline-none text-sm text-white placeholder:text-zinc-600 font-medium h-24 resize-none transition-all duration-200 focus:bg-white/[0.06] leading-relaxed"
          />

          <div className="flex gap-3">
            <div className="flex-1 min-w-0">
              {previews.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {previews.map((url, i) => (
                    <div key={i} className="relative group min-w-[80px] w-[80px] h-[80px] rounded-2xl overflow-hidden border border-white/10 shrink-0">
                      <img src={url} className="w-full h-full object-cover" alt="preview" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {files.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-w-[80px] w-[80px] h-[80px] rounded-2xl border border-dashed border-white/10 hover:border-[#D4FF33]/30 bg-white/[0.03] hover:bg-white/[0.06] flex flex-col items-center justify-center gap-1 text-zinc-600 hover:text-[#D4FF33] transition-all shrink-0"
                    >
                      <Plus size={16} />
                      <span className="text-[8px] font-bold uppercase">{files.length}/5</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={files.length >= 5}
                  className="w-full h-[80px] border border-dashed border-white/10 hover:border-[#D4FF33]/30 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] flex flex-col items-center justify-center gap-1.5 text-zinc-600 hover:text-[#D4FF33] transition-all group disabled:opacity-30"
                >
                  <Camera size={18} className="transition-transform group-hover:scale-110" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Add Photos</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 flex flex-col items-center justify-center gap-2 shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Rating</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="transition-transform active:scale-90 hover:scale-110 p-0.5"
                  >
                    <Star
                      size={16}
                      className={`transition-colors ${star <= displayStars ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-black text-white">{displayStars}.0</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#D4FF33] text-black rounded-2xl font-black uppercase tracking-tight text-[15px] hover:bg-[#c8f52e] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 flex items-center justify-center gap-2.5 shadow-[0_12px_32px_rgba(212,255,51,0.2)] mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Publishing...</span>
              </>
            ) : (
              'Publish Pick'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}