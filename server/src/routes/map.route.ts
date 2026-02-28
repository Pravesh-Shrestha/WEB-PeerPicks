import { Router } from 'express';
import { mapRepository } from '../repositories/map.reppository';

const router = Router();

/**
 * GET /api/map/nearby
 * Scans the physical grid for transmissions within a radius (meters).
 */
router.get('/nearby', async (req, res) => {
  try {
    const lng = Number(req.query.lng);
    const lat = Number(req.query.lat);
    const parsedRadius = Number(req.query.radius);
    const radius = Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 5000; // Default 5km

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
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
  } catch (error: any) {
    console.error("/api/map/nearby error", error?.message || error);
    res.status(500).json({ success: false, message: error?.message || "Regional scan failed." });
  }
});

export default router;