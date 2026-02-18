import { pickRepository } from "../repositories/pick.repository";
import { placeRepository } from "../repositories/place.repository";
import { socialRepository } from "../repositories/social.repository";
import { HttpError } from "../errors/http-error";
import { Types } from "mongoose";

export const pickService = {
  /**
   * CREATE: Synchronizes the Place Hub and saves the User Review.
   */
  async createNewPick(userId: string, placeData: any, reviewData: any) {
    // 1. Sync the Place Hub using the Google Link as the unique placeId.
    // This allows many users to review the same link without duplicating data.
    const place = await placeRepository.upsertPlace({
      placeId: placeData.link,      // The raw Google Maps URL
      name: placeData.alias,        // The User's Alias (e.g., "Favorite Chill Spot")
      category: placeData.category,
      address: placeData.link,      // Used for redirection
      location: { type: "Point", coordinates: [0, 0] } // Map disabled
    });

    if (!place) throw new HttpError(500, "Failed to synchronize location hub.");

    // 2. Create the Social Post (Pick)
    const pick = await pickRepository.create({
      user: new Types.ObjectId(userId),
      place: place.placeId,   
      alias: placeData.alias,        // The User's Alias (e.g., "Favorite Chill Spot")
      parentPick: reviewData.parentPickId || null,
      category: reviewData.category || null,
      stars: reviewData.stars,
      description: reviewData.description,
      mediaUrls: reviewData.mediaUrls, // Handled by updated upload middleware
      tags: reviewData.tags || []
    });

    // 3. If this is a response (Consensus), increment the parent's commentCount
    if (reviewData.parentPickId) {
      await socialRepository.incrementCommentCount(reviewData.parentPickId);
    }

    return pick;
  },

  /**
   * READ: Fetches the main Discovery Feed
   */
  async getDiscoveryFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await pickRepository.getDiscoveryFeed(limit, skip);
  },

  /**
   * READ: Single Pick detail view
   */
  async getPickById(id: string) {
    const pick = await pickRepository.findById(id);
    if (!pick) throw new HttpError(404, "Review not found.");
    return pick;
  },

  /**
   * READ: User's personal profile feed
   */
  async getPicksByUser(userId: string) {
    return await pickRepository.findByUser(userId);
  },

  /**
   * READ: Place Hub profile (Meta-data + all user reviews for this link)
   */
  async getPlaceHubDetails(linkId: string) {
    const place = await placeRepository.findByLinkId(linkId);
    if (!place) throw new HttpError(404, "Location link not found in our database.");

    // Finds all Picks associated with this specific Google Link
    const communityPicks = await pickRepository.findByPlace(linkId);

    return {
      place,
      communityPicks
    };
  },

  /**
   * UPDATE: Modify review text, stars, or tags
   * STRICT: Repository level check ensures user: userId matches
   */
  async updateUserPick(pickId: string, userId: string, updateData: any) {
    const updatedPick = await pickRepository.update(pickId, userId, updateData);
    if (!updatedPick) {
      throw new HttpError(403, "Update failed. You may not be the owner of this review.");
    }
    return updatedPick;
  },

  /**
   * DELETE: Strictly owner-only removal of a review
   */
  async deleteUserPick(pickId: string, userId: string) {
    const deleted = await pickRepository.delete(pickId, userId);
    if (!deleted) {
      throw new HttpError(403, "Delete failed. Unauthorized or review does not exist.");
    }
    return true;
  },

  async getPicksByCategory(category: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await pickRepository.findByCategory(category, limit, skip);
  },

  async getAllPicks() {
    return await pickRepository.findAllPicks();
  }
};