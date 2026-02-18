import { pickRepository } from '../repositories/pick.repository';
import { placeRepository } from '../repositories/place.repository';
import { socialRepository } from '../repositories/social.repository';
import { Types } from 'mongoose';

export const pickService = {
  /**
   * Orchestrates creating a Pick.
   * 1. Upserts the Place metadata.
   * 2. Creates the Pick.
   * 3. Updates parent engagement if it's a "re-pick".
   */
  async createNewPick(userId: string, placeData: any, reviewData: any) {
    // Sync Place metadata first to ensure the location exists in our DB
    const place = await placeRepository.upsertPlace({
      placeId: placeData.placeId,
      name: placeData.name,
      category: placeData.category,
      address: placeData.address,
      location: {
        type: "Point",
        coordinates: [placeData.lng, placeData.lat]
      }
    });

    if (!place) throw new Error("Failed to synchronize place metadata.");

    // Create the social post (The Pick)
    const pick = await pickRepository.create({
      user: new Types.ObjectId(userId),
      place: placeData.placeId,
      parentPick: reviewData.parentPickId || null,
      stars: reviewData.stars,
      description: reviewData.description,
      mediaUrls: reviewData.mediaUrls,
      tags: reviewData.tags
    });

    // If this is a review of someone else's review, increment their interaction count
    if (reviewData.parentPickId) {
      await socialRepository.incrementCommentCount(reviewData.parentPickId);
    }

    return pick;
  },

  /**
   * Fetches the discovery feed with pagination.
   */
  async getFeed(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return await pickRepository.getDiscoveryFeed(limit, skip);
  },

  /**
   * Business logic for deletion.
   * Ensures ownership before calling the repository delete.
   */
  async deleteUserPick(pickId: string, userId: string) {
    const deleted = await pickRepository.delete(pickId, userId);
    if (!deleted) throw new Error("Pick not found or unauthorized.");
    return deleted;
  }
}; 