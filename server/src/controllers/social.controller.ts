import { Request, Response } from "express";
import { pickRepository } from "../repositories/pick.repository";
import { UserRepository } from "../repositories/user.repository";
import { socialRepository } from "../repositories/social.repository";
import { notificationService } from "../services/notification.service";
import { favoriteRepository } from "../repositories/favorite.repository";

const userRepo = new UserRepository();

export const socialController = {
  /**
   * HANDLE VOTE: Toggles the atomic support signal.
   */
  handleVote: async (req: Request, res: Response) => {
    try {
      const { pickId } = req.params;
      // FIX: Use _id to match the identity object from middleware
      const userId = (req as any).user._id; 

      const target = await pickRepository.findById(pickId);
      if (!target) {
        return res.status(404).json({ success: false, message: "Target not found." });
      }

      const result = await socialRepository.toggleUpvote(userId, pickId);

      // ALERT SYSTEM: Only notify on a NEW signal
      if (result.action === "signaled") {
        await notificationService.createNotification({
          // Ensure recipient is a string ID
          recipient: target.user._id ? target.user._id.toString() : target.user.toString(),
          actor: userId.toString(),
          type: "VOTE",
          pickId: pickId,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          upvoteCount: result.count,
          userStatus: result.status ? "upvoted" : "cleared",
          action: result.action,
        },
      });
    } catch (error: any) {
      console.error("VOTE_SIGNAL_ERROR:", error.message);
      return res.status(500).json({ success: false, message: "Error processing support signal." });
    }
  },

  /**
   * TOGGLE FOLLOW: Connection logic between user nodes.
   */
  followUser: async (req: Request, res: Response) => {
    try {
      const { targetUserId } = req.params;
      const followerId = (req as any).user._id; // FIX: Use _id

      if (followerId.toString() === targetUserId.toString()) {
        return res.status(400).json({ success: false, message: "You cannot follow yourself." });
      }

      const isFollowing = await userRepo.isFollowing(followerId, targetUserId);

      if (isFollowing) {
        return res.status(200).json({ success: true, isFollowing: true });
      }

      await userRepo.follow(followerId, targetUserId);
      await notificationService.createNotification({
        recipient: targetUserId,
        actor: followerId.toString(),
        type: "FOLLOW",
      });

      return res.status(200).json({ success: true, isFollowing: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Follow action failed." });
    }
  },

  unfollowUser: async (req: Request, res: Response) => {
    try {
      const { targetUserId } = req.params;
      const followerId = (req as any).user._id;

      const isFollowing = await userRepo.isFollowing(followerId, targetUserId);

      if (!isFollowing) {
        return res.status(200).json({ success: true, isFollowing: false });
      }

      await userRepo.unfollow(followerId, targetUserId);
      return res.status(200).json({ success: true, isFollowing: false });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Unfollow action failed." });
    }
  },

  toggleFollow: async (req: Request, res: Response) => {
    try {
      const { targetUserId } = req.params;
      const followerId = (req as any).user._id;

      const isFollowing = await userRepo.isFollowing(followerId, targetUserId);

      if (isFollowing) {
        await userRepo.unfollow(followerId, targetUserId);
        return res.status(200).json({ success: true, isFollowing: false });
      }

      await userRepo.follow(followerId, targetUserId);
      await notificationService.createNotification({
        recipient: targetUserId,
        actor: followerId.toString(),
        type: "FOLLOW",
      });

      return res.status(200).json({ success: true, isFollowing: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Connection toggle failed." });
    }
  },

  /**
   * TOGGLE FAVORITE: Vault logic for saving picks.
   */
  toggleFavorite: async (req: Request, res: Response) => {
    try {
      const { pickId } = req.params;
      const userId = (req as any).user._id; // FIX: Use _id

      const target = await pickRepository.findById(pickId);
      if (!target) {
        return res.status(404).json({ success: false, message: "Target node not found." });
      }

      const result = await favoriteRepository.toggleSave(userId, pickId);

      if (result.isSaved) {
        const recipientId = target.user._id ? target.user._id.toString() : target.user.toString();
        await notificationService.createNotification({
          recipient: recipientId,
          actor: userId.toString(),
          type: "SAVE", 
          pickId: pickId,
        });
      }

      return res.status(200).json({
        success: true,
        isFavorited: result.isSaved,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Internal server error during vault sync." });
    }
  },

  /**
   * GET MY FAVORITES: Syncs user vault data.
   */
  getMyFavorites: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id; // FIX: Use _id
      const favorites = await favoriteRepository.findUserFavorites(userId);
      return res.status(200).json({ success: true, data: favorites });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Could not sync vault data." });
    }
  },
};