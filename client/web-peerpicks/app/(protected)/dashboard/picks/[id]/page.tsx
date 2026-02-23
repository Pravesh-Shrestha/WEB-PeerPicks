"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteComment, getPickDetail, updateComment } from "@/lib/actions/pick-action"; // Use the action file
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { postComment } from "@/lib/actions/pick-action"; // Action for posting comments
import { ChevronLeft, MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PickCard } from "../../components/shared/pick-card";

export default function PickDetailsPage() {
  const params = useParams();
  const id = params?.id as string; // Fixes the TypeScript ParamValue error
  const router = useRouter();
  const { user } = useAuth();

  const [pick, setPick] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // app/(protected)/dashboard/picks/[id]/page.tsx
  // app/(protected)/dashboard/picks/[id]/page.tsx

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      // 1. Fetch data using standardized endpoints
      const [pickRes, commentRes]: any = await Promise.all([
        getPickDetail(id),
        // Use the dedicated discussion endpoint
        axiosInstance.get(API.COMMENTS.GET_BY_PICK(id)),
      ]);

      // 2. Safely extract Pick Data
      const pickData = pickRes.data?.data || pickRes.data || pickRes;
      setPick(pickData);

      // 3. Extract Comments and handle the 'author' vs 'user' field mapping
      // Backend returns comment.author, not comment.user
      const rawComments = commentRes.data?.data || commentRes.data || [];

      // Protection: Ensure it's an array for .map()
      setComments(Array.isArray(rawComments) ? rawComments : []);
    } catch (error) {
      console.error("DATA_FETCH_FAILURE:", error);
      toast.error("SIGNAL LOST", { description: "Thread data unavailable." });
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);

      // Call the updated action
      const res: any = await postComment(id, newComment.trim());

      // CommentController returns: { success: true, data: commentObject }
      const createdComment = res.data?.data;

      if (createdComment) {
        setComments((prev) => [createdComment, ...prev]);
        setNewComment("");
        toast.success("SIGNAL DISPATCHED");
      }
    } catch (error: any) {
      toast.error("PROTOCOL_ERROR", { description: "Failed to post comment." });
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-10 animate-pulse space-y-8">
        <div className="h-8 w-32 bg-white/5 rounded-full" />
        <div className="h-[500px] w-full bg-white/5 rounded-[3.5rem]" />
      </div>
    );
  }

const handleDeleteComment = async (commentId: string) => {
  try {
    // Protocol Adherence: "delete" terminology [2026-02-01]
    await deleteComment(commentId);
    
    // Update local state to remove the signal immediately
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    toast.success("SIGNAL DELETED");
  } catch (error) {
    toast.error("DELETE_FAILED");
  }
};

const handleUpdateComment = async (commentId: string, text: string) => {
  try {
    const res = await updateComment(commentId, text);
    const updated = res.data?.data;
    
    setComments((prev) => 
      prev.map((c) => (c._id === commentId ? { ...c, content: updated.content } : c))
    );
    toast.success("SIGNAL UPDATED");
  } catch (error) {
    toast.error("UPDATE_FAILED");
  }
};

  if (!pick) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 pb-32">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-[#D4FF33] transition-colors mb-8 group"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Return to Feed
        </span>
      </button>

      <PickCard
        pick={pick}
        currentUserId={user?.id}
        onDeleteSuccess={() => {
          toast.success("SIGNAL DELETED");
          router.push("/dashboard/feed");
        }}
      />

      <div className="mt-12 space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <MessageSquare className="text-[#D4FF33]" size={20} />
          <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">
            Thread_Signals ({comments.length})
          </h3>
        </div>

        <form onSubmit={handlePostComment} className="relative group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add to the conversation..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white focus:border-[#D4FF33]/50 transition-all resize-none min-h-[120px]"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="absolute bottom-4 right-4 p-4 bg-[#D4FF33] text-black rounded-2xl transition-all"
          >
            <Send size={20} strokeWidth={3} />
          </button>
        </form>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {comments.map((comment: any) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex gap-4"
              >
                <img
                  // Check for 'author' (from model) or 'user' (from legacy)
                  src={comment.author?.profilePicture || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                  alt=""
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-sm font-bold text-white">
                      {comment.author?.fullName ||
                        comment.user?.fullName ||
                        "Anonymous"}
                    </h5>
                    {/* Add the Delete/Edit UI here */}
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
