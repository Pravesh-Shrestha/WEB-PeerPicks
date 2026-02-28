"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  MapPin,
  Star,
  X,
  Loader2,
  Video,
  Hash,
  Navigation,
  Utensils,
  Coffee,
  Pizza,
  ShoppingBag,
  Martini,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { API } from "@/lib/api/endpoints";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-zinc-900 animate-pulse rounded-[2rem]" />
  ),
});

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

const CATEGORIES = [
  { id: "food", label: "Dining", icon: Utensils },
  { id: "cafe", label: "Cafe", icon: Coffee },
  { id: "fastfood", label: "Quick Bite", icon: Pizza },
  { id: "nightlife", label: "Nightlife", icon: Martini },
  { id: "shopping", label: "Retail", icon: ShoppingBag },
  { id: "other", label: "Other", icon: MapPin },
];

interface CreateReviewFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function CreateReviewForm({
  onSuccess,
  onClose,
}: CreateReviewFormProps) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [files, setFiles] = useState<
    { file: File; preview: string; type: "image" | "video" }[]
  >([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast.error("LIMIT REACHED", {
        description: "Maximum 5 media items allowed.",
      });
      return;
    }
    const newFiles = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video")
        ? ("video" as const)
        : ("image" as const),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      const cleanTag = currentTag.trim().replace(/^#/, "");
      if (!tags.includes(cleanTag)) setTags([...tags, cleanTag]);
      setCurrentTag("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content || rating === 0 || !location || !category) {
      toast.error("INCOMPLETE DATA", {
        description: "Please fill in all fields.",
      });
      return;
    }

    if (!token) {
      toast.error("SESSION EXPIRED", { description: "Please log in again." });
      return;
    }
    const cleanToken = token.replace(/^"(.*)"$/, "$1");

    setLoading(true);
    const toastId = toast.loading("PUBLISHING...");

    try {
      const formData = new FormData();

      const placeInfo = {
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        category: category,
        alias: location.name.toLowerCase().replace(/\s+/g, "-"),
      };

      const reviewInfo = {
        description: content,
        stars: rating,
        category: category,
        tags: tags,
      };

      formData.append("placeInfo", JSON.stringify(placeInfo));
      formData.append("reviewInfo", JSON.stringify(reviewInfo));

      if (!location?.name || location.name === "Location:") {
        toast.error("LOCATION NOT VERIFIED", {
          description: "Please wait for the map to identify the sector.",
        });
        return;
      }

      files.forEach((item) => {
        formData.append("images", item.file);
      });

      const response = await fetch(API.PICKS.BASE, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("PICK PUBLISHED", { id: toastId });
        onSuccess();
      } else {
        toast.error("SUBMISSION FAILED", {
          id: toastId,
          description: result.message || "Protocol validation error.",
        });
      }
    } catch (error) {
      console.error("Transmission Error:", error);
      toast.error("NETWORK ERROR", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Outstanding"];

  return (
    <>
      <style>{`

        .review-form ::-webkit-scrollbar { width: 3px; }
        .review-form ::-webkit-scrollbar-track { background: transparent; }
        .review-form ::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }

        .review-form .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          border-radius: inherit;
        }

        .review-form .star-glow {
          filter: drop-shadow(0 0 10px rgba(212, 255, 51, 0.9));
        }

        .review-form .cat-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .review-form .cat-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(212,255,51,0.18) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .review-form .cat-btn:hover::after { opacity: 1; }
        .review-form .cat-btn.active::after { opacity: 1; background: transparent; }

        .review-form .media-slot {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .review-form .media-slot:hover { transform: scale(1.04); }

        .review-form .submit-btn {
          background: linear-gradient(135deg, #d4ff33 0%, #c5f020 100%);
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .review-form .submit-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: rgba(255,255,255,0.25);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .review-form .submit-btn:hover::before { left: 120%; }
        .review-form .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 16px 40px rgba(212, 255, 51, 0.45); }
        .review-form .submit-btn:active { transform: translateY(1px) scale(0.99); }
        .review-form .submit-btn:disabled { opacity: 0.25; transform: none !important; box-shadow: none !important; }

        .review-form .textarea-field {
          resize: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .review-form .textarea-field:focus {
          border-color: rgba(212, 255, 51, 0.45);
          box-shadow: 0 0 0 1px rgba(212, 255, 51, 0.12), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .review-form .section-label {
          letter-spacing: 0.3em;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: #888;
        }

        .review-form .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent);
        }

        .review-form .tag-pill {
          animation: tagIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes tagIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .review-form .location-pill {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .review-form .step-number {
          font-size: 10px;
          font-weight: 800;
          color: #555;
        }
      `}</style>

      <div className="review-form flex flex-col h-[95vh] w-full max-w-6xl mx-auto bg-[#0e0e10] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/[0.04] relative noise-bg">
        
        {/* Ambient glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(212,255,51,0.05) 0%, transparent 70%)",
          }}
        />

        {/* ─── Header ─── */}
        <div className="relative z-20 flex items-center justify-between px-10 py-8 border-b border-white/[0.10]">
          <div className="flex items-center gap-5">
            {/* Decorative accent line */}
            <div className="w-[3px] h-10 rounded-full bg-[#d4ff33] opacity-90" />
            <div>
              <h2 className="text-white font-black uppercase italic tracking-tighter text-2xl leading-none">
                New Pick
              </h2>
              <p className="section-label mt-1.5" style={{ color: "#aaa" }}>Community Verification</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group w-11 h-11 rounded-2xl bg-white/[0.07] border border-white/[0.15] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.13] hover:border-white/25 transition-all duration-200"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* ─── Scrollable Body ─── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-10 py-8 space-y-10"
        >

          {/* ── Author + Rating Row ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-white/25">
                  <img
                    src={user?.profilePicture || ""}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#d4ff33] border-2 border-[#0e0e10]" />
              </div>
              <div>
                <span className="text-white font-black uppercase italic tracking-tighter text-base block leading-none">
                  {user?.fullName}
                </span>
                <span className="section-label block mt-1.5" style={{ color: "#a0b840" }}>
                  Verified Reviewer
                </span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.12] px-5 py-3.5 rounded-2xl">
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = rating >= s;
                  const hovered = hoveredRating >= s;
                  return (
                    <Star
                      key={s}
                      size={28}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoveredRating(s)}
                      onMouseLeave={() => setHoveredRating(0)}
                      fill={filled || hovered ? "#d4ff33" : "none"}
                      className={`cursor-pointer transition-all duration-150 ${
                        filled
                          ? "text-[#d4ff33] star-glow scale-110"
                          : hovered
                          ? "text-[#d4ff33] opacity-60"
                          : "text-zinc-800 hover:text-zinc-600"
                      }`}
                    />
                  );
                })}
              </div>
              {(rating > 0 || hoveredRating > 0) && (
                <span className="section-label" style={{ color: "#a0b840" }}>
                  {ratingLabels[hoveredRating || rating]}
                </span>
              )}
            </div>
          </div>

          <div className="divider" />

          {/* ── Category ── */}
          <div className="space-y-4">
            <p className="section-label">01 — Category</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`cat-btn flex flex-col items-center justify-center py-4 px-2 rounded-2xl border transition-all gap-2.5 ${
                      active
                        ? "bg-[#d4ff33] border-[#d4ff33] text-black shadow-lg shadow-[#d4ff33]/20"
                        : "bg-white/[0.06] border-white/[0.15] text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/[0.10]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                      <span className="font-black uppercase tracking-tighter" style={{ fontSize: "9px" }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divider" />

          {/* ── Map ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="section-label">02 — Location</p>
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation(null)}
                  className="section-label hover:text-red-500 transition-colors"
                  style={{ color: "#ff4444", letterSpacing: "0.1em" }}
                >
                  Clear Pin
                </button>
              )}
            </div>

            <div
              className="w-full relative overflow-hidden"
              style={{
                height: "420px",
                borderRadius: "1.75rem",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 40px rgba(0,0,0,0.4)",
              }}
            >
              {/* Map overlay gradient top */}
              <div
                className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10"
                style={{
                  background: "linear-gradient(to bottom, rgba(14,14,16,0.5), transparent)",
                  borderRadius: "1.75rem 1.75rem 0 0",
                }}
              />
              <LocationPicker
                onLocationSelect={(lat, lng, name) =>
                  setLocation({ lat, lng, name })
                }
              />
              {location && (
                <div className="location-pill absolute bottom-6 left-6 right-6 z-[1000]">
                  <div
                    className="flex items-center gap-3.5 px-5 py-4 rounded-2xl"
                    style={{
                      background: "rgba(14,14,16,0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(212,255,51,0.4)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,255,51,0.1)",
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "#d4ff33" }}
                    >
                      <Navigation size={15} fill="black" className="text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="section-label mb-1" style={{ color: "#a0b840" }}>Venue Locked</p>
                      <p className="text-white text-sm font-medium truncate">
                        {location.name}
                      </p>
                    </div>
                    <div
                      className="flex-shrink-0 w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "#d4ff33" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="divider" />

          {/* ── Review Text ── */}
          <div className="space-y-4">
            <p className="section-label">03 — Your Experience</p>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What made this place a 'Pick'? Share the details that matter — atmosphere, service, the one dish you can't stop thinking about..."
                className="textarea-field w-full bg-white/[0.05] rounded-[1.5rem] px-7 py-6 text-[15px] leading-relaxed text-white focus:outline-none border border-white/[0.12] min-h-[180px] placeholder:text-zinc-500"
              />
              <div
                className="absolute bottom-4 right-5 section-label"
                style={{ color: content.length > 0 ? "#a0b840" : "#555" }}
              >
                {content.length} chars
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* ── Tags + Media ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tags */}
            <div className="space-y-3">
              <p className="section-label">04 — Tags</p>
              <div
                className="min-h-[52px] flex flex-wrap gap-2 items-start rounded-2xl border border-white/[0.12] p-3 bg-white/[0.04]"
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      background: "rgba(212,255,51,0.14)",
                      border: "1px solid rgba(212,255,51,0.35)",
                      color: "#d4ff33",
                    }}
                  >
                    #{tag}
                    <X
                      size={10}
                      className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                    />
                  </span>
                ))}
                {tags.length === 0 && (
                  <span className="text-zinc-500 text-xs p-1">No tags yet</span>
                )}
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.05] rounded-xl border border-white/[0.12] focus-within:border-[#d4ff33]/40 transition-all">
                <Hash size={14} className="text-zinc-400 flex-shrink-0" />
                <input
                  value={currentTag}
                  onKeyDown={addTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Type tag, press Enter..."
                  className="bg-transparent text-sm text-zinc-200 focus:outline-none w-full placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-3">
              <p className="section-label">05 — Media ({files.length}/5)</p>
              <div className="grid grid-cols-5 gap-2">
                {files.map((item, idx) => (
                  <div
                    key={idx}
                    className="media-slot relative aspect-square rounded-xl overflow-hidden border border-white/20 group bg-zinc-900"
                  >
                    <img
                      src={item.preview}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {files.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-white/[0.20] flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-[#d4ff33] hover:border-[#d4ff33]/50 hover:bg-[#d4ff33]/[0.05] transition-all"
                  >
                    <Camera size={16} />
                    <span style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* ─── Footer ─── */}
        <div
          className="relative z-20 flex items-center justify-between px-10 py-6 border-t border-white/[0.10]"
          style={{ background: "rgba(14,14,16,0.97)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/[0.15] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.12] hover:border-white/25 transition-all"
            >
              <Camera size={17} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/[0.15] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.12] hover:border-white/25 transition-all"
            >
              <Video size={17} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Completion indicators */}
          <div className="hidden sm:flex items-center gap-4">
            {[
              { done: !!category, label: "Category" },
              { done: !!location, label: "Location" },
              { done: !!content, label: "Review" },
              { done: rating > 0, label: "Rating" },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{ background: step.done ? "#d4ff33" : "#444" }}
                />
                <span className="section-label" style={{ color: step.done ? "#a0b840" : "#555" }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !content || rating === 0 || !category}
            onClick={handleSubmit}
            className="submit-btn text-black px-10 py-4 rounded-2xl font-black uppercase italic tracking-tighter text-xs flex items-center gap-2.5"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span>Publish Pick</span>
                <div className="w-1.5 h-1.5 rounded-full bg-black/30" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}