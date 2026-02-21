import { Router } from 'express';
import { notificationService } from '../services/notification.service';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';

const router = Router();

/**
 * GET /api/notifications
 * Retrieves the activity feed for the logged-in user.
 */
router.get('/', authorizedMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const alerts = await notificationService.getUserNotifications(userId);
    
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to sync alerts." });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Marks all pending alerts as viewed.
 */
router.patch('/read-all', authorizedMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    await notificationService.markAsRead(userId);
    
    res.status(200).json({ success: true, message: "Alerts cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update alert status." });
  }
});

export default router;