// repositories/social.repository.ts
import Pick from '../models/pick.model';
import mongoose from 'mongoose';

export const socialRepository = {
  async toggleUpvote(userId: string, pickId: string) {
    const userOID = new mongoose.Types.ObjectId(userId);

    // Atomic Toggle Logic:
    // Try to remove first; if nModified is 0, then we add.
    const pullResult = await Pick.updateOne(
      { _id: pickId, upvotes: userOID },
      { $pull: { upvotes: userOID }, $inc: { upvoteCount: -1 } }
    );

    let action = 'cleared';
    let status = false;

    if (pullResult.modifiedCount === 0) {
      await Pick.updateOne(
        { _id: pickId },
        { $addToSet: { upvotes: userOID }, $inc: { upvoteCount: 1 } }
      );
      action = 'signaled';
      status = true;
    }

    const updated = await Pick.findById(pickId).select('upvoteCount');
    return { success: true, status, count: updated?.upvoteCount || 0, action };
  },

async incrementCommentCount(pickId: string) {
    return await Pick.findByIdAndUpdate(pickId, { $inc: { commentCount: 1 } });
  },

  async decrementCommentCount(pickId: string) {
    // Protocol [2026-02-01]: Used during 'delete' actions
    return await Pick.findByIdAndUpdate(pickId, { $inc: { commentCount: -1 } });
  }
};