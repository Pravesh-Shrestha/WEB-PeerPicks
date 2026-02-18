import { Request, Response } from 'express';
import { pickService } from '../services/pick.service';

export const pickController = {
  /**
   * Handler for creating a new Pick.
   * Expects: { placeInfo: { ... }, reviewInfo: { ... } }
   */
  async createPick(req: Request, res: Response) {
    try {
      // Assuming your auth middleware attaches the user object to req
      const userId = (req as any).user._id;
      const { placeInfo, reviewInfo } = req.body;

      if (!placeInfo || !reviewInfo) {
        return res.status(400).json({
          success: false,
          message: "Missing required place or review information.",
        });
      }

      const newPick = await pickService.createNewPick(
        userId,
        placeInfo,
        reviewInfo,
      );

      return res.status(201).json({
        success: true,
        data: newPick,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error during pick creation.",
      });
    }
  },

  /**
   * Handler for fetching the Discovery Feed (FYP).
   * Supports pagination via query params: ?page=1&limit=10
   */
  async getDiscoveryFeed(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const feed = await pickService.getFeed(page, limit);

      return res.status(200).json({
        success: true,
        count: feed.length,
        data: feed,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch discovery feed.",
      });
    }
  },

  /**
   * Handler for deleting a Pick.
   * Strictly enforces that only the owner can delete.
   */
  async deletePick(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { id } = req.params;

      await pickService.deleteUserPick(id, userId);

      return res.status(200).json({
        success: true,
        message: "Pick has been deleted successfully.",
      });
    } catch (error: any) {
      // We use 403 or 404 depending on the error message from the service
      const statusCode = error.message.includes("unauthorized") ? 403 : 404;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  },
  /**
   * GET a single Pick by ID
   * GET /api/picks/:id
   */
  async getPick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pick = await pickService.getPickById(id);
      return res.status(200).json({ success: true, data: pick });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  },

  /**
   * UPDATE a Pick
   * PATCH /api/picks/:id
   */
  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { id } = req.params;

      const updated = await pickService.updatePick(id, userId, req.body);

      return res.status(200).json({
        success: true,
        message: "Pick updated successfully",
        data: updated,
      });
    } catch (error: any) {
      const status = error.message.includes("unauthorized") ? 403 : 400;
      return res
        .status(status)
        .json({ success: false, message: error.message });
    }
  },
};