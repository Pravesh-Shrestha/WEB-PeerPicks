import { Request, Response } from 'express';
import { socialService } from '../services/social.service';

export const socialController = {
  /**
   * TOGGLE SUPPORT: Handles the atomic upvote/downvote
   */
  async handleSupport(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const { id: pickId } = req.params;

      const result = await socialService.handleUpvote(userId, pickId);
      
      return res.status(200).json({
        success: true,
        action: result.action, // Returns 'created' if liked, 'deleted' if unliked
        status: result.status
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Action failed" });
    }
  }
};