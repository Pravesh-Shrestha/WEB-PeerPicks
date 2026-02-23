import { socialRepository } from '../repositories/social.repository';
import { notificationService } from './notification.service';
import { pickRepository } from '../repositories/pick.repository';
import { HttpError } from '../errors/http-error';

export const socialService = {
  /**
   * HANDLE UPVOTE
   * String: "{User} upvoted your pick."
   */
  async handleUpvote(userId: string, pickId: string) {
    const result = await socialRepository.toggleUpvote(userId, pickId);
    const pick = await pickRepository.findById(pickId);

    if (result.status && pick) {
      await notificationService.createNotification({
        recipient: pick.user,
        actor: userId,
        type: 'VOTE',
        pickId: pick._id,
        message: "upvoted your pick." 
      });
    }
    return result;
  },

  /**
   * HANDLE COMMENT
   * String: "{User} commented on your pick."
   */
  async handleComment(userId: string, pickId: string, content: string) {
    // 1. Find the target pick
    const parentPick = await pickRepository.findById(pickId);
    if (!parentPick) throw new HttpError(404, "Target pick not found.");

    // 2. Since your architecture treats comments as "Picks" with a parentId:
    // This part usually calls your pickRepository.create or commentRepository.create
    // For this example, we'll assume the comment is created and we trigger the signal:
    
    await notificationService.createNotification({
      recipient: parentPick.user,
      actor: userId,
      type: 'COMMENT',
      pickId: parentPick._id,
      message: "commented on your pick."
    });

    // Increment count in the background
    await socialRepository.incrementCommentCount(pickId);
    
    return { success: true };
  },

  /**
   * HANDLE SAVE
   * String: "{User} save your pick."
   */
  async handleSave(userId: string, pickId: string) {
    const pick = await pickRepository.findById(pickId);
    if (!pick) throw new HttpError(404, "Pick not found.");

    // Note: You'll need a save/bookmark method in your repository
    // const result = await socialRepository.toggleSave(userId, pickId);

    await notificationService.createNotification({
      recipient: pick.user,
      actor: userId,
      type: 'SAVE',
      pickId: pick._id,
      message: "save your pick."
    });

    return { success: true, signaled: true };
  }
};