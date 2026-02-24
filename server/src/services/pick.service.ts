import { pickRepository } from "../repositories/pick.repository";
import { placeRepository } from "../repositories/place.repository";
import { socialRepository } from "../repositories/social.repository";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { Types } from "mongoose";
import { CommentRepository } from "../repositories/comment.repository";
import { notificationService } from "../services/notification.service"; // Delegation to Service

const userRepo = new UserRepository();
const commentRepo = new CommentRepository();

/**
 * IDENTITY RESOLUTION:
 * Ensures every pick carries its user node metadata and interaction status.
 */
const hydratePicks = async (picks: any | any[], currentUserId?: string) => {
  const isArray = Array.isArray(picks);
  const picksList = isArray ? picks : [picks];

  const hydrated = await Promise.all(
    picksList.map(async (pick) => {
      const pickObj = pick.toObject ? pick.toObject() : pick;

      // --- IDENTITY RESOLUTION ---
      let userData = pickObj.user;
      if (typeof userData === "string" || userData instanceof Types.ObjectId) {
        userData = await userRepo.getUserById(userData.toString());
      }

      const hasUpvoted = currentUserId
        ? pickObj.upvotes?.some((id: any) => id.toString() === currentUserId)
        : false;

      return {
        ...pickObj,
        user: userData,
        hasUpvoted,
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
   * Includes automated notification dispatch via SSE.
   */
  async createNewPick(userId: string, placeData: any, reviewData: any) {
    // 1. Sync the Place Hub
    const place = await placeRepository.upsertPlace({
      placeId: placeData.name,
      name: placeData.name,
      category: placeData.category,
      address: placeData.name,
      location: {
        type: "Point",
        coordinates: [placeData.lng, placeData.lat],
      },
    });

    if (!place) throw new HttpError(500, "Failed to synchronize location hub.");

    // 2. Create the Pick (Resolves coordinate & place requirements)
    const pick = await pickRepository.create({
      user: new Types.ObjectId(userId),
      place: place._id,
      alias: placeData.alias,
      parentPick: reviewData.parentPickId
        ? new Types.ObjectId(reviewData.parentPickId)
        : undefined,
      category: reviewData.category || null,
      stars: reviewData.stars || 0,
      description: reviewData.description,
      mediaUrls: reviewData.mediaUrls || [],
      tags: reviewData.tags || [],
      location: {
        type: "Point",
        coordinates: [placeData.lng, placeData.lat],
      },
    });

    // 3. Increment counters if this is a reply (signal)
    if (reviewData.parentPickId) {
      await socialRepository.incrementCommentCount(reviewData.parentPickId);

      const parentPick = await pickRepository.findById(reviewData.parentPickId);

      // --- NOTIFICATION DISPATCH (VETERAN MOVE) ---
      // We delegate to the notificationService to handle DB persistence,
      // self-notification guards, and real-time SSE broadcasting.
      if (parentPick) {
        const parentOwnerId = parentPick.user.toString();
        const currentUserId = userId.toString();
        if (parentOwnerId !== currentUserId) {
          await notificationService.createNotification({
            recipient: parentPick.user,
            actor: userId.toString(),
            type: "COMMENT",
            pickId: parentPick._id,
            message: "broadcasted a new signal on your pick.",
            status: "info",
          });
        }
      }
    }

    return pick;
  },

  /**
   * READ: Fetches the discussion thread (replies) for a specific Pick.
   */
  async getDiscussion(pickId: string, currentUserId?: string) {
    const parent = await pickRepository.findById(pickId);
    if (!parent) throw new Error("PICK_NOT_FOUND");

    const hydratedParent = await hydratePicks(parent, currentUserId);
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
   * READ: Place Hub profile
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
    if (!updatedPick) throw new HttpError(403, "Update failed. Unauthorized.");
    return updatedPick;
  },

  /**
   * DELETE: owner-only removal [2026-02-01]
   * Changed terminology to 'delete' per project constraints.
   */
  async deleteUserPick(pickId: string, userId: string) {
    const pick = await pickRepository.findById(pickId);
    if (!pick) throw new HttpError(404, "Pick not found.");

    if (pick.parentPick) {
      await socialRepository.decrementCommentCount(pick.parentPick.toString());
    }

    const deleted = await pickRepository.delete(pickId, userId);
    if (!deleted) throw new HttpError(403, "Delete failed. Unauthorized.");
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
    const user = await userRepo.getUserById(userId);
    if (!user) throw new HttpError(404, "User node not found.");

    const picks = await pickRepository.findByUser(userId);
    const hydratedPicks = await hydratePicks(picks, currentUserId);

    const isFollowing = currentUserId
      ? await userRepo.isFollowing(currentUserId, userId)
      : false;

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
