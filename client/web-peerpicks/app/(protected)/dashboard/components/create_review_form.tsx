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
  Martini,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import dynamic from "next/dynamic";
import { toast } from "sonner"; // Import Sonner
import { API } from "@/lib/api/endpoints";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-zinc-900 animate-pulse rounded-[2.5rem]" />
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

    // 1. Validation
    if (!content || rating === 0 || !location || !category) {
      toast.error("INCOMPLETE DATA", {
        description: "Please fill in all fields.",
      });
      return;
    }

    // 2. Token Retrieval (from AuthContext)
    if (!token) {
      toast.error("SESSION EXPIRED", { description: "Please log in again." });
      return;
    }
    const cleanToken = token.replace(/^"(.*)"$/, "$1");

    setLoading(true);
    const toastId = toast.loading("PUBLISHING...");

    try {
      const formData = new FormData();

      // 3. STRUCTURE DATA FOR YOUR CONTROLLER
      // Your controller expects req.body.placeInfo as a JSON string
      const placeInfo = {
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        category: category,
        alias: location.name.toLowerCase().replace(/\s+/g, "-"),
      };

      // Your controller expects req.body.reviewInfo as a JSON string
      const reviewInfo = {
        description: content,
        stars: rating,
        category: category,
        tags: tags,
      };

      formData.append("placeInfo", JSON.stringify(placeInfo));
      formData.append("reviewInfo", JSON.stringify(reviewInfo));

      if (
        !location?.name ||
        location.name === "Location:"
      ) {
        toast.error("LOCATION NOT VERIFIED", {
          description: "Please wait for the map to identify the sector.",
        });
        return;
      }

      // 4. ATTACH MEDIA
      // Based on the Multer error, ensure the field name is 'images'
      // (or check if your route uses upload.array('media'))
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

  return (
    <div className="flex flex-col h-[95vh] w-full max-w-6xl mx-auto bg-[#121214] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between p-10 border-b border-white/5 bg-[#121214]/80 backdrop-blur-md z-20">
        <div>
          <h2 className="text-white font-black uppercase italic tracking-tighter text-3xl">
            New Pick
          </h2>
          <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.3em] mt-1">
            Submit your verification for the community
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-4 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all hover:rotate-90"
        >
          <X size={24} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide"
      >
        {/* User & Stars */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4FF33] overflow-hidden shadow-lg shadow-[#D4FF33]/10">
              <img
                src={user?.profilePicture || ""}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-white font-black uppercase italic text-xl block leading-none">
                {user?.fullName}
              </span>
              <span className="text-[#D4FF33] text-[10px] font-black uppercase tracking-widest">
                Verified Peer Status
              </span>
            </div>
          </div>

          <div className="flex gap-3 bg-white/5 p-4 rounded-3xl border border-white/5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={32}
                onClick={() => setRating(s)}
                fill={rating >= s ? "#D4FF33" : "none"}
                className={`cursor-pointer transition-all ${rating >= s ? "text-[#D4FF33] scale-110" : "text-zinc-800 hover:text-zinc-600"}`}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">
            Choose Category
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all gap-2 ${active ? "bg-[#D4FF33] border-[#D4FF33] text-black shadow-lg" : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/20"}`}
                >
                  <Icon size={20} />
                  <span className="font-black uppercase text-[9px] tracking-tighter">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              <MapPin size={14} className="text-[#D4FF33]" />{" "}
              {location
                ? "Venue Identified"
                : "Search or Tap Map to Identify Place"}
            </div>
            {location && (
              <button
                type="button"
                onClick={() => setLocation(null)}
                className="text-[9px] font-black uppercase text-red-500 hover:underline"
              >
                Delete Pin
              </button>
            )}
          </div>
          <div className="w-full h-[450px] bg-zinc-900 rounded-[3rem] border border-white/5 relative overflow-hidden ring-1 ring-white/10 shadow-inner">
            <LocationPicker
              onLocationSelect={(lat, lng, name) =>
                setLocation({ lat, lng, name })
              }
            />
            {location && (
              <div className="absolute bottom-8 left-8 right-8 z-[1000] animate-in slide-in-from-bottom-6 duration-500">
                <div className="bg-[#121214]/90 backdrop-blur-2xl border border-[#D4FF33]/30 p-5 rounded-[2rem] shadow-2xl flex items-center gap-4">
                  <div className="bg-[#D4FF33] p-3 rounded-2xl text-black">
                    <Navigation size={18} fill="black" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                      Venue Selected
                    </p>
                    <p className="text-white text-sm font-bold truncate italic">
                      {location.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What made this place a 'Pick'? Tell the community about the experience..."
          className="w-full bg-white/5 rounded-[3rem] p-10 text-xl text-white focus:outline-none border border-white/5 focus:border-[#D4FF33]/30 min-h-[200px] transition-all placeholder:text-zinc-800"
        />

        {/* Media & Tags Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-[#D4FF33]/10 text-[#D4FF33] border border-[#D4FF33]/20 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                >
                  #{tag}{" "}
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  />
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 px-6 py-5 bg-white/5 rounded-3xl border border-white/5 focus-within:border-[#D4FF33]/30 transition-all">
              <Hash size={20} className="text-zinc-700" />
              <input
                value={currentTag}
                onKeyDown={addTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add specific tags..."
                className="bg-transparent text-sm text-white focus:outline-none w-full font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {files.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-zinc-900"
              >
                <img
                  src={item.preview}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-zinc-700 hover:text-[#D4FF33] hover:border-[#D4FF33]/30 transition-all"
              >
                <Camera size={20} />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Footer / Submit */}
      <div className="p-10 border-t border-white/5 flex items-center justify-between bg-[#121214] z-20">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 text-zinc-500 hover:text-[#D4FF33] transition-all"
          >
            <Camera size={28} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 text-zinc-500 hover:text-[#D4FF33] transition-all"
          >
            <Video size={28} />
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

        <button
          type="submit"
          disabled={loading || !content || rating === 0 || !category}
          onClick={handleSubmit}
          className="bg-[#D4FF33] text-black px-16 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.25em] disabled:opacity-10 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#D4FF33]/20 flex items-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Broadcasting...</span>
            </>
          ) : (
            "Publish Pick"
          )}
        </button>
      </div>
    </div>
  );
}
