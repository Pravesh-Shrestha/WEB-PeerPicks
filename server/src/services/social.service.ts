import { socialRepository } from '../repositories/social.repository';

export const socialService = {
  /**
   * Handles the upvote toggle logic.
   * Automatically increments/decrements the Pick's upvoteCount.
   */
  async handleUpvote(userId: string, pickId: string) {
    // This calls the repository toggle which handles the 'deleted' or 'created' state
    const result = await socialRepository.toggleUpvote(userId, pickId);
    
    // Logic for sending notifications to the author can be added here
    return result;
  },

  /**
   * Standalone logic for adding/removing comments.
   */
  async syncCommentCount(pickId: string) {
    return await socialRepository.incrementCommentCount(pickId);
  }
};