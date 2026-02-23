// repositories/social.repository.ts
import Pick from '../models/pick.model';
import mongoose from 'mongoose';

export const socialRepository = {
  async toggleUpvote(userId: string, pickId: string) {
    const userOID = new mongoose.Types.ObjectId(userId);
    const pickOID = new mongoose.Types.ObjectId(pickId);

    // 1. ATOMIC PULL: Attempt to DELETE the existing vote signal
    const pullResult = await Pick.updateOne(
      { _id: pickOID, upvotes: userOID },
      { $pull: { upvotes: userOID }, $inc: { upvoteCount: -1 } }
    );

    let action = 'cleared';
    let status = false;

    // 2. ATOMIC PUSH: If no vote was deleted, add the new signal
    if (pullResult.modifiedCount === 0) {
      await Pick.updateOne(
        { _id: pickOID },
        { $addToSet: { upvotes: userOID }, $inc: { upvoteCount: 1 } }
      );
      action = 'signaled';
      status = true;
    }

    // 3. FINAL SYNC: Fetch the most recent count
    // Using 'lean' for performance as we only need the raw number
    const updated = await Pick.findById(pickOID).select('upvoteCount');
    
    return { 
      success: true, 
      status, 
      count: updated?.upvoteCount ?? 0, 
      action 
    };
  },

  async incrementCommentCount(pickId: string) {
    return await Pick.findByIdAndUpdate(
      pickId, 
      { $inc: { commentCount: 1 } },
      { new: true } // Return the document AFTER update
    );
  },

  async decrementCommentCount(pickId: string) {
    /**
     * PROTOCOL COMPLIANT [2026-02-01]: Used during 'delete' actions.
     * Added a $gt guard to ensure we never drop below 0.
     */
    return await Pick.findOneAndUpdate(
      { _id: pickId, commentCount: { $gt: 0 } }, 
      { $inc: { commentCount: -1 } },
      { new: true }
    );
  }
};