import { pickRepository } from "../repositories/pick.repository";
import { placeRepository } from "../repositories/place.repository";
import { socialRepository } from "../repositories/social.repository";
import { UserRepository } from "../repositories/user.repository"; // Added to check follow status
import { HttpError } from "../errors/http-error";
import { Types } from "mongoose";
import { notificationRepository } from "repositories/notification.repository";
import { CommentRepository } from "../repositories/comment.repository";

const userRepo = new UserRepository();
const commentRepo = new CommentRepository();

// pick.service.ts

const hydratePicks = async (picks: any | any[], currentUserId?: string) => {
  const isArray = Array.isArray(picks);
  const picksList = isArray ? picks : [picks];

  const currentUser = currentUserId
    ? await userRepo.getUserById(currentUserId)
    : null;

  const hydrated = await Promise.all(
    picksList.map(async (pick) => {
      const pickObj = pick.toObject ? pick.toObject() : pick;

      // --- IDENTITY RESOLUTION ---
      let userData = pickObj.user;
      // If user is just an ID, fetch the full node so the name appears
      if (typeof userData === "string" || userData instanceof Types.ObjectId) {
        userData = await userRepo.getUserById(userData.toString());
      }

      const hasUpvoted = currentUserId
        ? pickObj.upvotes?.some((id: any) => id.toString() === currentUserId)
        : false;

      return {
        ...pickObj,
        user: userData, // Name and Profile Picture are now guaranteed
        hasUpvoted,
        // Metadata mapping
        locationName: pickObj.placeDetails?.name || "Unknown Sector",
        stars: pickObj.stars || 0,
      };
    }),
  );

  return isArray ? hydrated : hydrated[0];
};
export const pickService = {
  /**
   * CREATE: Synchronizes the Place Hub and saves the User Review or Comment.
   */
  async createNewPick(userId: string, placeData: any, reviewData: any) {
    // 1. Sync the Place Hub
    const place = await placeRepository.upsertPlace({
      placeId: placeData.name, // Ensure this matches your link/id logic
      name: placeData.name,
      category: placeData.category,
      address: placeData.name,
      // FIX: Pass actual coordinates to the place hub too
      location: {
        type: "Point",
        coordinates: [placeData.lng, placeData.lat],
      },
    });

    if (!place) throw new HttpError(500, "Failed to synchronize location hub.");

    // 2. Create the Pick with the REQUIRED location field
    const pick = await pickRepository.create({
      user: new Types.ObjectId(userId),
      place: place._id, // Matches 'place' required path in error
      alias: placeData.alias,
      parentPick: reviewData.parentPickId
        ? new Types.ObjectId(reviewData.parentPickId)
        : undefined,
      category: reviewData.category || null,
      stars: reviewData.stars || 0,
      description: reviewData.description,
      mediaUrls: reviewData.mediaUrls || [],
      tags: reviewData.tags || [],
      // FIX: This solves the "location.coordinates is required" error
      location: {
        type: "Point",
        coordinates: [placeData.lng, placeData.lat],
      },
    });

    if (reviewData.parentPickId) {
      await socialRepository.incrementCommentCount(reviewData.parentPickId);
    }

    return pick;
  },

  /**
   * READ: Fetches the discussion thread (replies) for a specific Pick.
   */

  async getDiscussion(pickId: string, currentUserId?: string) {
    // 1. Fetch the parent pick details to satisfy the frontend loader
    const parent = await pickRepository.findById(pickId);
    if (!parent) throw new Error("PICK_NOT_FOUND");

    // 2. Hydrate parent with user details and upvote status
    const hydratedParent = await hydratePicks(parent, currentUserId);

    // 3. Fetch signals via the Repository instance
    // The Repository's findByPickId already populates 'author'
    const signals = await commentRepo.findByPickId(pickId);

    return {
      parent: hydratedParent,
      signals: signals,
      commentCount: signals.length,
    };
  },
  /**
   * READ: Discovery Feed with interaction status
   */
  async getDiscoveryFeed(page: number, limit: number, currentUserId?: string) {
    const skip = (page - 1) * limit;
    const picks = await pickRepository.getDiscoveryFeed(limit, skip);
    return await hydratePicks(picks, currentUserId);
  },

  /**
   * READ: Single Pick detail view
   */
  async getPickById(id: string, currentUserId?: string) {
    const pick = await pickRepository.findById(id);
    if (!pick) throw new HttpError(404, "Review not found.");
    return await hydratePicks(pick, currentUserId);
  },

  /**
   * READ: Place Hub profile (Meta-data + all user reviews for this link)
   */
  async getPlaceHubDetails(linkId: string, currentUserId?: string) {
    const place = await placeRepository.findByLinkId(linkId);
    if (!place) throw new HttpError(404, "Location link not found.");

    const communityPicks = await pickRepository.findByPlace(linkId);
    const hydratedPicks = await hydratePicks(communityPicks, currentUserId);

    return {
      place,
      communityPicks: hydratedPicks,
    };
  },

  /**
   * UPDATE: Modify review text, stars, or tags
   */
  async updateUserPick(pickId: string, userId: string, updateData: any) {
    const updatedPick = await pickRepository.update(pickId, userId, updateData);
    if (!updatedPick) {
      throw new HttpError(403, "Update failed. Unauthorized.");
    }
    return updatedPick;
  },

  /**
   * DELETE: owner-only removal, syncing commentCount if it's a comment.
   */
  async deleteUserPick(pickId: string, userId: string) {
    const pick = await pickRepository.findById(pickId);
    if (!pick) throw new HttpError(404, "Pick not found.");

    // Decrement parent's count if deleting a comment
    if (pick.parentPick) {
      await socialRepository.decrementCommentCount(pick.parentPick.toString());
    }

    const deleted = await pickRepository.delete(pickId, userId);
    if (!deleted) {
      throw new HttpError(403, "Delete failed. Unauthorized.");
    }
    return true;
  },

  async getPicksByCategory(
    category: string,
    page: number,
    limit: number,
    currentUserId?: string,
  ) {
    const skip = (page - 1) * limit;
    const picks = await pickRepository.findByCategory(category, limit, skip);
    return await hydratePicks(picks, currentUserId);
  },

  async getAllPicks() {
    return await pickRepository.findAllPicks();
  },
  async getPicksByUser(userId: string, currentUserId?: string) {
    // 1. Fetch User Metadata from the repository
    const user = await userRepo.getUserById(userId);
    if (!user) throw new HttpError(404, "User node not found.");

    // 2. Fetch the actual picks (posts)
    const picks = await pickRepository.findByUser(userId);
    const hydratedPicks = await hydratePicks(picks, currentUserId);

    // 3. Determine if the current viewer is following this specific profile
    const isFollowing = currentUserId
      ? await userRepo.isFollowing(currentUserId, userId)
      : false;

    // 4. Return unified structure to satisfy the frontend state
    return {
      profile: {
        ...user.toObject(),
        isFollowing,
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
      },
      picks: hydratedPicks,
    };
  },
};
