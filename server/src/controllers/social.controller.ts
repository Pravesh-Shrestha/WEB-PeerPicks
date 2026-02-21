import { Request, Response } from "express";
import { Types } from "mongoose";
import { pickRepository } from "../repositories/pick.repository";
import { UserRepository } from "../repositories/user.repository";
import { socialRepository } from "../repositories/social.repository";
import { notificationService } from "../services/notification.service";
import { favoriteRepository } from "../repositories/favorite.repository";

const userRepo = new UserRepository();

export const socialController = {
  /**
   * HANDLE VOTE: Toggles the support signal.
   * Updated to use the Engagement model and socialRepository logic.
   */
  handleVote: async (req: Request, res: Response) => {
    try {
      const { pickId } = req.params;
      const userId = (req as any).user.id;

      // 1. Verify the Pick/Comment exists
      const target = await pickRepository.findById(pickId);
      if (!target) {
        return res
          .status(404)
          .json({ success: false, message: "Target not found." });
      }

      // 2. Call the repository to toggle the upvote
      const result = await socialRepository.toggleUpvote(userId, pickId);

      // --- FEATURE 4: ALERT SYSTEM HOOK ---
      // Only notify if a NEW signal was created (not deleted)
      if (result.action === "created") {
        await notificationService.createNotification({
          recipient: target.user.toString(), // The owner of the post/comment
          actor: userId, // The person who voted
          type: "CONSENSUS",
          pickId: pickId,
        });
      }
      // ------------------------------------

      // 3. Return consistent response
      return res.status(200).json({
        success: true,
        data: {
          upvoteCount: result.count,
          userStatus: result.status ? "upvoted" : "cleared",
          action: result.action,
        },
      });
    } catch (error) {
      console.error("Vote Controller Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error processing support signal." });
    }
  },

  /**
   * POST COMMENT: Adds a new discussion entry.
   * Inherits place data from parent to maintain consistency in the DB.
   */
  postComment: async (req: Request, res: Response) => {
    try {
      const { pickId } = req.params;
      const { description } = req.body;
      const userId = (req as any).user.id;

      const parentPick = await pickRepository.findById(pickId);
      if (!parentPick)
        return res
          .status(404)
          .json({ success: false, message: "Parent not found." });

      const comment = await pickRepository.create({
        user: new Types.ObjectId(userId),
        parentPick: new Types.ObjectId(pickId),
        description,
        place: parentPick.place,
        alias: parentPick.alias,
        category: parentPick.category,
        stars: 1,
        upvoteCount: 0,
        downvoteCount: 0,
      });

      await socialRepository.incrementCommentCount(pickId);

      // --- FEATURE 4: ALERT SYSTEM HOOK ---
      await notificationService.createNotification({
        recipient: parentPick.user._id.toString(), // Notify the post owner
        actor: userId,
        type: "DISCUSSION",
        pickId: pickId,
      });

      const populatedComment = await pickRepository.findById(
        comment._id.toString(),
      );
      return res.status(201).json({ success: true, data: populatedComment });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error posting comment." });
    }
  },

  /**
   * TOGGLE FOLLOW: Toggles relationship between users.
   */
  toggleFollow: async (req: Request, res: Response) => {
    try {
      const { targetUserId } = req.params;
      const followerId = (req as any).user.id;

      const isFollowing = await userRepo.isFollowing(followerId, targetUserId);

      if (isFollowing) {
        await userRepo.unfollow(followerId, targetUserId);
      } else {
        await userRepo.follow(followerId, targetUserId);

        // --- ALERT SYSTEM HOOK ---
        await notificationService.createNotification({
          recipient: targetUserId,
          actor: followerId,
          type: "CONNECTION",
        });
      }

      return res.status(200).json({ success: true, isFollowing: !isFollowing });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Connection toggle failed." });
    }
  },

  /**
   * UPDATE COMMENT: Modifies the text of a specific discussion entry.
   */
  updateComment: async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const { description } = req.body;
      const userId = (req as any).user.id;

      // Use the repository update which checks for { _id: commentId, user: userId }
      const updated = await pickRepository.update(commentId, userId, {
        description,
      });

      if (!updated) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized or comment not found.",
        });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error updating comment." });
    }
  },

  /**
   * DELETE COMMENT: Strictly owner-only removal.
   */
  deleteComment: async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const userId = (req as any).user.id;

      // Pass BOTH arguments to satisfy the repository's 2-argument requirement
      const success = await pickRepository.delete(commentId, userId);

      if (!success) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized or comment not found.",
        });
      }

      // Decrement the parent pick's consensus counter
      const comment = await pickRepository.findById(commentId);
      if (comment?.parentPick) {
        await socialRepository.decrementCommentCount(
          comment.parentPick.toString(),
        );
      }

      return res
        .status(200)
        .json({ success: true, message: "Comment successfully deleted." });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error deleting comment." });
    }
  },
  /**
   * TOGGLE FAVORITE: Adds or removes a pick from the user's personal vault.
   * Linked to the "Save" button in the PickCard.
   */
  // src/controllers/social.controller.ts

  toggleFavorite: async (req: Request, res: Response) => {
    try {
      const { pickId } = req.params;
      const userId = (req as any).user.id;

      // 1. Check if the Pick exists first (READ ONLY)
      const target = await pickRepository.findById(pickId);
      if (!target) {
        return res
          .status(404)
          .json({ success: false, message: "Target node not found." });
      }

      // 2. CRITICAL FIX: Use favoriteRepository, NOT pickRepository
      // This should only create a Favorite record (User ID + Pick ID)
      const result = await favoriteRepository.toggleSave(userId, pickId);

      if (result.isSaved) {
        // Determine the recipient ID safely
        const recipientId = target.user._id
          ? target.user._id.toString()
          : target.user.toString();

        await notificationService.createNotification({
          recipient: recipientId, // Pass a clean string
          actor: userId,
          type: "CONNECTION",
          pickId: pickId,
        });
      }

      // Ensure this return is OUTSIDE the notification logic if possible
      return res.status(200).json({
        success: true,
        isFavorited: result.isSaved,
        message: result.message,
      });
    } catch (error: any) {
      // This is where the "Pick validation failed" error was being caught
      console.error("Favorite Toggle Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during vault sync.",
      });
    }
  },

  /**
   * GET MY FAVORITES: Fetches the list of picks saved by the current user.
   * Resolves the 404 error on the Favorites Page.
   */
  getMyFavorites: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      // Fetch the list of saved picks for this specific user identity
      const favorites = await favoriteRepository.findUserFavorites(userId);

      return res.status(200).json({
        success: true,
        data: favorites, // The frontend handles unwrapping this array
      });
    } catch (error) {
      console.error("Fetch Favorites Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Could not sync vault data." });
    }
  },
};
