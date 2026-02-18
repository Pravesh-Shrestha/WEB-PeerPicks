import Upvote from '../models/engagement.model';
import Pick from '../models/pick.model';

export const socialRepository = {
  /**
   * Toggles an upvote for a specific pick.
   * If the upvote exists, it is deleted (unlike/downvote logic).
   * If it doesn't exist, it is created.
   */
  async toggleUpvote(userId: string, pickId: string) {
    // 1. Check if the user has already upvoted this pick
    const existingUpvote = await Upvote.findOne({ user: userId, pick: pickId });

    if (existingUpvote) {
      // 2. Action: DELETE (Follows your specific 'delete' naming convention)
      await Upvote.findByIdAndDelete(existingUpvote._id);

      // 3. Atomically decrement the upvote count on the Pick
      await Pick.findByIdAndUpdate(pickId, { $inc: { upvoteCount: -1 } });

      return { action: 'deleted', status: false };
    } else {
      // 2. Action: CREATE
      await Upvote.create({ user: userId, pick: pickId });

      // 3. Atomically increment the upvote count on the Pick
      await Pick.findByIdAndUpdate(pickId, { $inc: { upvoteCount: 1 } });

      return { action: 'created', status: true };
    }
  },

  /**
   * Increments the comment count on a pick.
   * This is triggered when someone adds a comment or reviews the review.
   */
  async incrementCommentCount(pickId: string) {
    return await Pick.findByIdAndUpdate(pickId, { $inc: { commentCount: 1 } }, { new: true });
  },

  /**
   * Checks if a user has upvoted a specific pick.
   * Useful for the frontend to show a 'filled' heart icon.
   */
  async checkUserUpvote(userId: string, pickId: string) {
    const count = await Upvote.countDocuments({ user: userId, pick: pickId });
    return count > 0;
  }
};