import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

// Global registry for SSE clients to enable broadcasting
let sseClients: { userId: string; res: Response }[] = [];

export const notificationController = {
  /**
   * SSE PROTOCOL: Establish Real-time Stream
   * GET /api/notifications/stream
   */
  establishStream: async (req: Request, res: Response) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({ success: false, message: "AUTH_REQUIRED" });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'SYSTEM', message: 'SIGNAL_LINK_ESTABLISHED' })}\n\n`);

    // Add client to active registry
    const newClient = { userId, res };
    sseClients.push(newClient);

    // Keep-alive heartbeat every 20s
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 20000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients = sseClients.filter(client => client !== newClient);
    });
  },

  // Helper method for other services to "Push" to the UI
  broadcastToUser: (userId: string, payload: any) => {
    const targets = sseClients.filter(c => c.userId === userId);
    targets.forEach(c => c.res.write(`data: ${JSON.stringify(payload)}\n\n`));
  },

  // GET /api/notifications
  getMyNotifications: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)._id;
      const data = await notificationService.getUserSignals(userId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: `FETCH_ERROR: ${error.message}` });
    }
  },

  // GET /api/notifications/unread-count
  getUnreadCount: async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "PROTOCOL_ERROR: Node identity not found" 
        });
      }

      const count = await notificationService.getUnreadSignalCount(userId);
      return res.status(200).json({ success: true, count });
    } catch (error: any) {
      console.error("SIGNAL_FETCH_CRASH:", error.message);
      return res.status(500).json({ success: false, message: "INTERNAL_NODE_ERROR" });
    }
  },

  // PATCH /api/notifications/read
  markAsRead: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)._id;
      await notificationService.syncReadStatus(userId);
      res.status(200).json({ success: true, message: "Node synchronized." });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PROTOCOL COMPLIANT: Delete Signal [2026-02-01]
   * Changed from "purge" to "delete" per design specs.
   */
  deleteNotification: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)._id;
      const { id } = req.params;
      await notificationService.deleteSignal(id, userId);
      res.status(200).json({ success: true, message: "Signal deleted from node memory." });
    } catch (error: any) {
      res.status(500).json({ success: false, message: `DELETE_FAILURE: ${error.message}` });
    }
  }
};