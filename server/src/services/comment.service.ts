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
    // 1. Create Node
    const comment = await Comment.create({ pick: pickId, author: authorId, content });
    
    // 2. Sync Consensus (Incremental)
    await socialRepository.incrementCommentCount(pickId);

    // 3. Dispatch Notification Signal
    const parentPick = await Pick.findById(pickId);
    if (parentPick && parentPick.author && parentPick.author.toString() !== authorId) {
      await notificationService.createNotification({
        recipient: parentPick.author,
        actor: authorId,
        type: 'COMMENT',
        pickId: pickId,
        message: `replied to your pick: "${parentPick.title}"`,
      });
    }

  return comment.populate('author', 'fullName profilePicture');
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
