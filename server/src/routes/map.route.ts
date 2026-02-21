import { Router } from 'express';
import { mapRepository } from '../repositories/map.reppository';

const router = Router();

/**
 * GET /api/map/nearby
 * Scans the physical grid for transmissions within a radius (meters).
 */
router.get('/nearby', async (req, res) => {
  try {
    const lng = parseFloat(req.query.lng as string);
    const lat = parseFloat(req.query.lat as string);
    const radius = parseInt(req.query.radius as string) || 5000; // Default 5km

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ 
        success: false, 
        message: "Spatial coordinates (lng, lat) are required for a regional scan." 
      });
    }

    const transmissions = await mapRepository.findNearbyTransmissions(lng, lat, radius);
    
    res.status(200).json({ 
      success: true, 
      count: transmissions.length,
      data: transmissions 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Regional scan failed." });
  }
});

export default router;