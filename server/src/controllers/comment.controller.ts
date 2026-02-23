import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';

const commentService = new CommentService();

export class CommentController {
  async createComment(req: Request, res: Response) {
    try {
      const { pickId, content } = req.body;
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!content) return res.status(400).json({ success: false, message: "Content required" });

      const comment = await commentService.createComment(pickId, userId, content);

      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?._id || (req as any).user?.id;

      const deletedComment = await commentService.deleteComment(id, userId);

      if (!deletedComment) {
        return res.status(404).json({ 
          success: false, 
          message: "Comment not found or unauthorized delete attempt." 
        });
      }

      res.status(200).json({ 
        success: true, 
        message: "Comment deleted successfully." 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!content) return res.status(400).json({ success: false, message: "Content required" });

      const updatedComment = await commentService.updateComment(id, userId, content);
      if (!updatedComment) {
        return res.status(404).json({ 
          success: false, 
          message: "Comment not found or unauthorized update attempt." 
        });
      }
      res.status(200).json({ 
        success: true, 
        data: updatedComment
        });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
}