import { Request, Response } from 'express';
import { pickService } from '../services/pick.service';
import { HttpError } from '../errors/http-error';

export const pickController = {
  /**
   * CREATE: Handles multi-part form data (Images + JSON strings)
   */
  async createPick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;

      // 1. Validate Body exists (Safety Guard)
      if (!req.body.placeInfo || !req.body.reviewInfo) {
        throw new HttpError(400, "placeInfo and reviewInfo are required as JSON strings.");
      }

      // 2. Parse JSON from form-data strings
      const placeData = JSON.parse(req.body.placeInfo);
      const reviewData = JSON.parse(req.body.reviewInfo);

      // 3. Process Uploaded Files
      const files = req.files as Express.Multer.File[];
      const localMediaUrls = files 
        ? files.map(file => `/uploads/picks/${file.filename}`) 
        : [];

      // 4. Merge local file paths into the review object
      const finalReview = {
        ...reviewData,
        mediaUrls: [...(reviewData.mediaUrls || []), ...localMediaUrls]
      };

      const newPick = await pickService.createNewPick(userId, placeData, finalReview);

      return res.status(201).json({
        success: true,
        data: newPick
      });
    } catch (error: any) {
      const status = error instanceof HttpError ? error.statusCode : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  },

  /**
   * READ: Get Single Pick with Populated Data
   */
  async getPick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pick = await pickService.getPickById(id);
      
      if (!pick) throw new HttpError(404, "Pick not found");

      return res.status(200).json({ success: true, data: pick });
    } catch (error: any) {
      const status = error instanceof HttpError ? error.statusCode : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  },

  /**
   * READ: Get Discovery Feed (Paginated)
   */
async getDiscoveryFeed(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // This calls the getFeed method from your screenshot
    const feedData = await pickService.getFeed(page, limit);

    return res.status(200).json({
      success: true,
      ...feedData
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch feed" });
  }
},

  /**
   * UPDATE: Modify text/stars (Note: Usually doesn't handle new file uploads)
   */
  async updatePick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const { id } = req.params;

      // Ensure the user is passing the correct fields to update
      const updatedPick = await pickService.updatePick(id, userId, req.body);

      return res.status(200).json({
        success: true,
        data: updatedPick
      });
    } catch (error: any) {
      const status = error instanceof HttpError ? error.statusCode : 403;
      return res.status(status).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE: Remove pick from DB (Cleanup of physical files happens in Service)
   */
  async deletePick(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id;
      const { id } = req.params;

      // Using your requested term 'delete'
      await pickService.deleteUserPick(id, userId);

      return res.status(200).json({
        success: true,
        message: "Pick deleted successfully."
      });
    } catch (error: any) {
      const status = error instanceof HttpError ? error.statusCode : 404;
      return res.status(status).json({ success: false, message: error.message });
    }
  },

  async getUserPicks(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const profileData = await pickService.getPicksByUser(userId, page, limit);

            return res.status(200).json({
                success: true,
                data: profileData.picks,
                pagination: {
                    total: profileData.total,
                    currentPage: profileData.currentPage,
                    totalPages: profileData.totalPages
                }
            });
        } catch (error: any) {
            return res.status(500).json({ 
                success: false, 
                message: error.message || "Error fetching user picks" 
            });
        }
    },
};