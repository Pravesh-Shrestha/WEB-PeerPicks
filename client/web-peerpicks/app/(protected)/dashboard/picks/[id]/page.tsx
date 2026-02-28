"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteComment,
  postComment,
  getPickDiscussion,
  updateComment, // Ensure this exists in your actions
} from "@/lib/actions/pick-action";
import {
  ChevronLeft,
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  Edit3,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PickCard } from "../../components/shared/pick-card";
import { getMediaUrl } from "@/lib/utils";

export default function PickDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [pick, setPick] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // EDITING STATE
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    // 1. Concurrency Guard: Prevents redundant signals during double-mounts
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const res: any = await getPickDiscussion(id);

      /**
       * 2. The Unwrapping Fix:
       * Your JSON: { success: true, data: { parent: {...}, signals: [] } }
       * Depending on your axios interceptor, 'res' might be the full response
       * or just the 'data' property from the controller.
       */
      const payload = res?.data || res;

      // Check for the specific structure returned by your controller/service
      if (payload && payload.parent) {
        // 3. Set Pick Details: This satisfies the 'if (!pick)' check and clears the loader
        setPick(payload.parent);

        // 4. Set Signals: Uses the 'signals' key from your service
        setComments(payload.signals || []);

        console.log("PROTOCOL_SYNC_COMPLETE", {
          nodeId: id,
          signalsFound: payload.signals?.length,
          headerCount: payload.commentCount,
        });
      } else {
        console.warn(
          "PROTOCOL_INCOMPLETE: Discussion payload missing parent node",
        );
        // Optional: Set a fallback or error state if the parent data is missing
      }
    } catch (error) {
      console.error("TRANSMISSION_FAILED:", error);
      toast.error("SIGNAL_INTERRUPTED");
    } finally {
      // 5. CRITICAL: Always clear the loading state to stop the hang
      setLoading(false);
      isFetching.current = false;
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ACTIONS ---

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || submitting || !user || !pick) return;

    const tempId = `temp-${Date.now()}`;

    // 1. Optimistic UI Prep
    const optimisticComment = {
      _id: tempId,
      content: content,
      author: {
        _id: user?._id || user?.id,
        fullName: user?.fullName || "You",
        profilePicture: user?.profilePicture,
      },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    try {
      setSubmitting(true);
      setNewComment("");

      // Update UI immediately
      setComments((prev) => [optimisticComment, ...prev]);
      setPick((prev: any) => ({
        ...prev,
        commentCount: (prev?.commentCount || 0) + 1,
      }));

      const res: any = await postComment(id, {
      pickId: id,   // Backend expects 'pickId'
      content: content, // Backend expects 'content'
    });

      const savedComment = res?.data || res;

      if (savedComment && savedComment._id) {
        // 3. Terminology Sync [2026-02-01]
        toast.success("Signal broadcasted successfully");

        // Reconciliation
        setComments((prev) =>
          prev.map((c) =>
            c._id === tempId
              ? {
                  ...savedComment,
                  author: optimisticComment.author,
                  isOptimistic: false,
                }
              : c,
          ),
        );
      } else {
        fetchData();
      }
    } catch (error) {
      // Rollback logic...
      setComments((prev) => prev.filter((c) => c._id !== tempId));
      setPick((prev: any) => ({
        ...prev,
        commentCount: Math.max(0, (prev?.commentCount || 0) - 1),
      }));
      setNewComment(content);
      toast.error("DISPATCH_FAILED");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editValue.trim()) return;
    const originalValue = comments.find((c) => c._id === commentId)?.content;

    try {
      // Optimistic Update
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editValue } : c,
        ),
      );
      setEditingId(null);

      await updateComment(commentId, editValue);
      toast.success("SIGNAL_UPDATED");
    } catch (error) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: originalValue } : c,
        ),
      );
      toast.error("UPDATE_FAILED");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // Protocol Adherence: "delete" terminology [2026-02-01]
    try {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPick((prev: any) => ({
        ...prev,
        commentCount: Math.max(0, (prev?.commentCount || 0) - 1),
      }));
      await deleteComment(commentId);
      toast.success("SIGNAL_DELETED");
    } catch (error) {
      toast.error("DELETE_FAILED");
      fetchData();
    }
  };

  if (loading)
    return (
      <div className="p-20 text-[#D4FF33] font-mono animate-pulse">
        Loading post...
      </div>
    );
  if (!pick) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 pb-32 text-left">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-[#D4FF33] mb-8 group transition-colors"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Back to feed
        </span>
      </button>

      <PickCard
        pick={pick}
        currentUserId={user?._id || user?.id}
        onDeleteSuccess={() => router.push("/dashboard")}
      />

      <div className="mt-12 space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <MessageSquare className="text-[#D4FF33]" size={20} />
          <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">
            Comments ({pick.commentCount || 0})
          </h3>
        </div>

        {/* INPUT BOX */}
        <form onSubmit={handlePostComment} className="relative group/form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              isAuthenticated ? "Write a comment..." : "Please log in to comment"
            }
            disabled={!isAuthenticated || submitting}
            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-white focus:border-[#D4FF33]/50 focus:bg-white/[0.05] transition-all resize-none min-h-[140px] outline-none"
          />
          <button
            type="submit"
            title="Post comment"
            aria-label="Post comment"
            disabled={!newComment.trim() || submitting || !isAuthenticated}
            className="absolute bottom-4 right-4 p-4 bg-[#D4FF33] text-black rounded-2xl disabled:opacity-20 transition-all active:scale-90"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} strokeWidth={3} />
            )}
          </button>
        </form>

        {/* SIGNALS LIST */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {comments.map((comment: any) => {
              // 1. DATA TARGETING: Point to 'author' (from Repository)
              const authorData = comment.author;
              const isEditing = editingId === comment._id;

              // 2. IDENTITY RESOLUTION: Robust ID comparison
              // Ensure we compare strings to avoid object-reference mismatches
              const authorId = authorData?._id || authorData?.id || authorData;
              const currentId = user?._id || user?.id;
              const isOwner =
                currentId &&
                authorId &&
                currentId.toString() === authorId.toString();

              // 3. UI HYDRATION: Fetch detailed user info
              const fullName = authorData?.fullName || "Anonymous_Node";
              const avatarSrc =
                getMediaUrl(authorData?.profilePicture, "profilePicture") ||
                "/default-avatar.png";

              return (
                <motion.div
                  key={comment._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: comment.isOptimistic ? 0.5 : 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  className="p-6 bg-white/[0.01] border border-white/5 rounded-[2rem] flex gap-5 group/item hover:bg-white/[0.03] transition-all"
                >
                  <img
                    src={avatarSrc}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg"
                    alt={fullName}
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-white tracking-tight">
                          {fullName}
                        </h5>
                        {comment.isOptimistic && (
                          <span className="text-[8px] font-mono text-[#D4FF33] animate-pulse">
                            BROADCASTING...
                          </span>
                        )}
                      </div>

                      {/* Protocol [2026-02-01]: Owner-only delete/edit actions */}
                      {isOwner && !isEditing && (
                        <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditValue(comment.content);
                            }}
                            className="p-2 text-zinc-500 hover:text-[#D4FF33] hover:bg-white/5 rounded-lg transition-all"
                            title="Edit Signal"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Signal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-3">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-black border border-[#D4FF33]/30 rounded-xl p-4 text-sm text-white outline-none focus:border-[#D4FF33] min-h-[100px]"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateComment(comment._id)}
                            title="Save comment changes"
                            aria-label="Save comment changes"
                            className="px-4 py-2 bg-[#D4FF33] text-black rounded-lg text-xs font-bold flex items-center gap-2 active:scale-95"
                          >
                            <Check size={14} strokeWidth={3} /> SAVE_CHANGES
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            title="Cancel editing"
                            aria-label="Cancel editing"
                            className="px-4 py-2 bg-white/5 text-zinc-400 rounded-lg text-xs font-bold hover:bg-white/10"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
