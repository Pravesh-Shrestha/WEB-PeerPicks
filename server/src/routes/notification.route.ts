import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
 // Ensure only logged-in nodes can connect

const router = Router();

// Apply auth middleware to all notification routes
router.use(authorizedMiddleware);

/**
 * 1. SSE Real-time Stream 
 * This keeps the connection open for the Next.js EventSource
 */
router.get('/stream', notificationController.establishStream);

/**
 * 2. Static Data Paths
 * Standard REST endpoints for fetching and syncing state
 */
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read', notificationController.markAsRead);
router.get('/', notificationController.getMyNotifications);

/**
 * 3. Dynamic Paths [2026-02-01 PROTOCOL]
 * Terminology updated to 'delete'
 */
router.delete('/:id', notificationController.deleteNotification);

export default router;