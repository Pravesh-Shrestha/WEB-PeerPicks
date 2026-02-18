import Upvote from '../models/engagement.model';
import Pick from '../models/pick.model';

export const socialRepository = {
  /**
   * UPVOTE/DOWNVOTE: Toggles the support signal.
   */
  async toggleUpvote(userId: string, pickId: string) {
    const existing = await Upvote.findOne({ user: userId, pick: pickId });

    if (existing) {
      // DELETE existing signal
      await Upvote.findByIdAndDelete(existing._id);
      await Pick.findByIdAndUpdate(pickId, { $inc: { upvoteCount: -1 } });
      return { action: 'deleted', status: false };
    } else {
      // CREATE new signal
      await Upvote.create({ user: userId, pick: pickId });
      await Pick.findByIdAndUpdate(pickId, { $inc: { upvoteCount: 1 } });
      return { action: 'created', status: true };
    }
  },

  /**
   * CONSENSUS: Increments the comment count.
   */
  async incrementCommentCount(pickId: string) {
    return await Pick.findByIdAndUpdate(
      pickId, 
      { $inc: { commentCount: 1 } }, 
      { new: true }
    );
  }
};