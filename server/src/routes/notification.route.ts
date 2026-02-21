import express from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';  

const router = express.Router();

// All notification operations require an active session
router.use(authorizedMiddleware);

router.get('/', notificationController.getMyNotifications);
router.patch('/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteNotification); // Delete Protocol [2026-02-01]

export default router;