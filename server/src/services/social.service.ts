import { socialRepository } from '../repositories/social.repository';

export const socialService = {
  /**
   * TOGGLE SUPPORT: Handles the Upvote logic.
   * If user already upvoted, it 'deletes' the upvote.
   * If not, it 'creates' one.
   */
  async handleUpvote(userId: string, pickId: string) {
    // result returns { action: 'created' | 'deleted', status: boolean }
    const result = await socialRepository.toggleUpvote(userId, pickId);
    return result;
  },

  /**
   * CONSENSUS TRACKING: Manages the count of reports/comments on a pick.
   */
  async syncCommentCount(pickId: string) {
    return await socialRepository.incrementCommentCount(pickId);
  }
};