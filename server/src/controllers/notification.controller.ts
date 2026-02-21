import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { HttpError } from '../errors/http-error';

export const notificationController = {
  /**
   * READ: Fetch alerts for the current authenticated node.
   */
  async getMyNotifications(req: Request, res: Response) {
    try {
      // Accessing ID via the middleware's attached user object
      const userId = (req.user as any)._id || (req.user as any).id;
      
      const notifications = await notificationService.getUserNotifications(userId);
      
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "SIGNAL LOSS: Could not retrieve notifications." 
      });
    }
  },

  /**
   * UPDATE: Mark all notifications as seen.
   */
  async markRead(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id || (req.user as any).id;
      await notificationService.markAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: "Notifications synchronized."
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE: Strictly enforced removal of an alert.
   * Protocol Compliance: Terminology "Delete" [2026-02-01]
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req.user as any)._id || (req.user as any).id;

      // Passing userId ensures a user can't delete someone else's notification via URL
      await notificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: "NOTIFICATION DELETED"
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "PROTOCOL ERROR: Delete failed."
      });
    }
  }
};