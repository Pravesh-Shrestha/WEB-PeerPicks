// repositories/comment.repository.ts
import Comment, { IComment } from '../models/comment.model';
import { Types } from 'mongoose';

export class CommentRepository {
  /**
   * CREATE: Persist new discussion entry
   */
  async create(data: Partial<IComment>) {
    return await Comment.create(data);
  }

  /**
   * READ: Fetch thread for a specific pick
   * Automatically filters out isDeleted: true via Schema Middleware
   */
  async findByPickId(pickId: string) {
    return await Comment.find({ pick: new Types.ObjectId(pickId) })
      .populate('author', 'fullName profilePicture')
      .sort({ createdAt: 1 });
  }

  /**
   * DELETE: Protocol [2026-02-01]
   * Implements soft delete to preserve database integrity
   */
  async delete(commentId: string, authorId: string) {
    return await Comment.findOneAndUpdate(
      { _id: commentId, author: authorId },
      { isDeleted: true }, // [2026-02-01] Soft delete support
      { new: true }
    );
  }

  async update(commentId: string, authorId: string, content: string) {
    return await Comment.findOneAndUpdate(
      { _id: new Types.ObjectId(commentId), author: new Types.ObjectId(authorId) },
      { content, updatedAt: new Date() },
      { new: true }
    ).populate('author', 'fullName profilePicture');
  }
}
