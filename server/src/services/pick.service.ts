import { pickRepository } from "../repositories/pick.repository";
import { placeRepository } from "../repositories/place.repository";
import { socialRepository } from "../repositories/social.repository";
import { Types } from "mongoose";

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
        coordinates: [placeData.lng, placeData.lat],
      },
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
      tags: reviewData.tags,
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
async getFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    // We fetch the count and the data simultaneously for speed
    const [picks, total] = await Promise.all([
        pickRepository.findAll(limit, skip),
        pickRepository.countAll()
    ]);

    return { 
        picks, 
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
    };
},

  /**
   * Business logic for deletion.
   * Ensures ownership before calling the repository delete.
   */
  async deleteUserPick(pickId: string, userId: string) {
    const deleted = await pickRepository.delete(pickId, userId);
    if (!deleted) throw new Error("Pick not found or unauthorized.");
    return deleted;
  },
  // Add these to your pickService object
  async updatePick(pickId: string, userId: string, updateData: any) {
    // Logic: Only allow updating specific fields
    const allowedUpdates = {
      stars: updateData.stars,
      description: updateData.description,
      mediaUrls: updateData.mediaUrls,
      tags: updateData.tags,
    };

    const updatedPick = await pickRepository.update(
      pickId,
      userId,
      allowedUpdates,
    );
    if (!updatedPick)
      throw new Error("Pick not found or unauthorized to edit.");

    return updatedPick;
  },

  async getPickById(id: string) {
    const pick = await pickRepository.findByIdRaw(id);
    if (!pick) throw new Error("Pick not found.");
    return pick;
  },
  async getPicksByUser(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        
        const [picks, total] = await Promise.all([
            pickRepository.findByUser(userId, limit, skip),
            pickRepository.countByUser(userId)
        ]);

        return {
            picks,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        };
    },

};
