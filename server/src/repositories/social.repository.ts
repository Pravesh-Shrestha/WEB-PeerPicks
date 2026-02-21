import Pick from '../models/pick.model';
import mongoose from 'mongoose';

export const socialRepository = {
  /**
   * TOGGLE CONSENSUS: Handles the atomic upvote signal.
   * This ensures the counter and user list are ALWAYS in sync.
   */
  async toggleUpvote(userId: string, pickId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // 1. Check if user already signaled consensus
    const pick = await Pick.findById(pickId);
    if (!pick) throw new Error("Transmission not found");

    const hasUpvoted = pick.upvotes.includes(userObjectId);

    // 2. Atomic Update: Uses $addToSet to prevent duplicates and $inc for the count
    const update = hasUpvoted 
      ? { $pull: { upvotes: userObjectId }, $inc: { upvoteCount: -1 } }
      : { $addToSet: { upvotes: userObjectId }, $inc: { upvoteCount: 1 } };

    const updatedPick = await Pick.findByIdAndUpdate(
      pickId,
      update,
      { new: true }
    );

    return {
      success: true,
      status: !hasUpvoted, // true if now upvoted
      count: updatedPick?.upvoteCount || 0,
      action: hasUpvoted ? 'cleared' : 'signaled'
    };
  },

  async incrementCommentCount(pickId: string) {
    return await Pick.findByIdAndUpdate(pickId, { $inc: { commentCount: 1 } }, { new: true });
  },

  async decrementCommentCount(pickId: string) {
    return await Pick.findByIdAndUpdate(pickId, { $inc: { commentCount: -1 } }, { new: true });
  }
};