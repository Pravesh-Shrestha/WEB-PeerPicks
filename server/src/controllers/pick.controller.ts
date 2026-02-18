import { Request, Response } from 'express';
import { pickService } from '../services/pick.service';
import { HttpError } from '../errors/http-error';

export const pickController = {
  /**
   * CREATE: Process new social post
   * Parses 'placeInfo' and 'reviewInfo' JSON strings from FormData
   */
  async createPick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;

      if (!req.body.placeInfo || !req.body.reviewInfo) {
          throw new HttpError(400, "Incomplete post data.");
      }

      const placeData = JSON.parse(req.body.placeInfo); // { link, alias, category }
      const reviewData = JSON.parse(req.body.reviewInfo); // { stars, description, tags }

      // Map files to URLs (Supports up to 5 photos/videos)
      const files = req.files as Express.Multer.File[];
      const mediaUrls = files ? files.map(file => `/uploads/picks/${file.filename}`) : [];

      const newPick = await pickService.createNewPick(
        userId, 
        placeData, 
        { ...reviewData, mediaUrls }
      );

      res.status(201).json({ success: true, data: newPick });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  /**
   * READ: Discovery Feed (Instagram-style)
   */
  async getDiscoveryFeed(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const feed = await pickService.getDiscoveryFeed(page, limit);
      res.status(200).json({ success: true, data: feed });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * READ: Single Pick details
   */
  async getPick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pick = await pickService.getPickById(id);
      if (!pick) throw new HttpError(404, "Review not found.");
      
      res.status(200).json({ success: true, data: pick });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  /**
   * READ: User Profile Grid
   */
  async getUserPicks(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const picks = await pickService.getPicksByUser(userId);
      res.status(200).json({ success: true, data: picks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * READ: Place Hub Data (All reviews for one link)
   */
  async getPlaceProfile(req: Request, res: Response) {
    try {
      const { linkId } = req.params;
      const data = await pickService.getPlaceHubDetails(decodeURIComponent(linkId));
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  /**
   * UPDATE: Owner-only edit
   */
  async updatePick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const { id } = req.params;

      const updated = await pickService.updateUserPick(id, userId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(error.statusCode || 403).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE: Strictly owner-only removal
   */
  async deletePick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const { id } = req.params;

      await pickService.deleteUserPick(id, userId);
      res.status(200).json({ success: true, message: "Review deleted." });
    } catch (error: any) {
      res.status(error.statusCode || 403).json({ success: false, message: error.message });
    }
  },
  /**
   * READ: Category-based feed filtering
   */
  async getPicksByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const picks = await pickService.getPicksByCategory(category, page, limit);
      res.status(200).json({ success: true, data: picks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  /**
   * READ: Fetch all picks (for testing or admin purposes)
   */
  async getAllPicks(req: Request, res: Response) {
    try {
      const picks = await pickService.getAllPicks();
      res.status(200).json({ success: true, data: picks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

};