"use client";

import axios from 'axios';
import { useState } from 'react';
import { API } from '@/lib/api/endpoints'; // Adjust path to your API list
import { toast } from 'sonner';

interface CommentFormProps {
  parentPickId: string;
  // Passing the parent place data ensures the backend 'place hub' syncs correctly
  parentPlaceData: {
    name: string;
    category: string;
    lat: number;
    lng: number;
  };
}

export default function CommentForm({ parentPickId, parentPlaceData }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      // 1. Logic Sync: We use the PICKS.BASE endpoint as the backend 
      // treats a comment as a 'Pick' with a 'parentPickId'.
      await axios.post(API.PICKS.BASE, {
        // Essential for notifications: identifies the thread
        parentPickId: parentPickId, 
        
        // Essential for DB: satisfies 'location' & 'place' requirements
        placeData: {
          name: parentPlaceData.name,
          category: parentPlaceData.category,
          lat: parentPlaceData.lat,
          lng: parentPlaceData.lng,
        },
        
        // The actual comment content
        reviewData: {
          description: comment,
          stars: 0, // Comments usually don't need stars
        }
      }, {
        headers: {
          // [2026-02-01] Identity Signal: Critical for 'Actor' identification
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      setComment("");
      toast.success("Signal broadcasted successfully");
      
      // OPTIONAL: Refresh page or local state to show the new comment
      window.location.reload(); 
      
    } catch (err: any) {
      console.error("Signal broadcast failed:", err);
      toast.error(err.response?.data?.message || "Failed to broadcast signal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add to the discussion..."
        className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-4 text-sm focus:outline-none focus:border-[#D4FF33]/50 transition-all"
        rows={3}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="bg-[#D4FF33] text-black font-black uppercase text-[11px] tracking-widest px-6 py-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isSubmitting ? "Broadcasting..." : "Broadcast Comment"}
        </button>
      </div>
    </form>
  );
}