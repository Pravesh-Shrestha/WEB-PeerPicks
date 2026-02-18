import { Request, Response } from 'express';
import { placeService } from '../services/place.service';

export const placeController = {
  /**
   * READ: Fetches the hub details and all community reviews
   */
  async getPlaceProfile(req: Request, res: Response) {
    try {
      const { linkId } = req.params; // The encoded Google URL
      const data = await placeService.getPlaceHubDetails(decodeURIComponent(linkId));
      
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
};