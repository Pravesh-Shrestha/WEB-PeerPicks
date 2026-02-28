// services/comment.service.ts
import { socialRepository } from "../repositories/social.repository";
import Comment from "../models/comment.model";
import Pick from "../models/pick.model";
import { notificationService } from "./notification.service";
import mongoose from "mongoose";

export class CommentService {
async createComment(pickId: string, authorId: string, content: string) {
  if (!mongoose.Types.ObjectId.isValid(pickId)) {
    throw new Error("Invalid Transmission ID");
  }
    // 1. Resolve the parent pick; fail fast if missing
    const parentPick = await Pick.findById(pickId).select("user alias author userId");
    if (!parentPick) {
      throw new Error("PICK_NOT_FOUND");
    }

    // 2. Create Node
    const comment = await Comment.create({ pick: pickId, author: authorId, content });
    
    // 3. Sync Consensus (Incremental)
    await socialRepository.incrementCommentCount(pickId);

    // 4. Dispatch Notification Signal (supports legacy 'author' field just in case)
    const pickOwnerId = (parentPick as any).user?.toString()
      || (parentPick as any).author?.toString()
      || (parentPick as any).userId?.toString();

    if (!pickOwnerId) {
      console.warn(`[COMMENT_NOTIFY_SKIP] Missing pick owner for pick ${pickId}`);
    }

    // Skip self-notify; send to pick owner when different
    if (pickOwnerId && pickOwnerId !== authorId) {
      await notificationService.createNotification({
        recipient: pickOwnerId,
        actor: authorId,
        type: 'COMMENT',
        pickId,
        message: `commented on your pick: "${parentPick?.alias || "Your pick"}"`,
      });
    }

  return await comment.populate('author', 'fullName profilePicture');
}
  // READ (Thread)
async getThreadByPickId(pickId: string) {
    return await Comment.find({ pick: pickId })
      .populate("author", "fullName profilePicture")
      .sort({ createdAt: 1 });
}

  // UPDATE
async updateComment(commentId: string, userId: string, newContent: string) {
    return await Comment.findOneAndUpdate(
      { _id: commentId, author: userId },
      { content: newContent },
      { new: true },
    ).populate("author", "fullName profilePicture");
}

async deleteComment(commentId: string, userId: string) {
    // Protocol [2026-02-01]: "delete" replaces "purge"
    const comment = await Comment.findOne({ _id: commentId, author: userId });
    if (!comment) return null;

    await socialRepository.decrementCommentCount(comment.pick.toString());
    return await Comment.findOneAndDelete({ _id: commentId, author: userId });
}
}
