import Notification from '../models/notification.model';
import { HttpError } from '../errors/http-error';
import { socketGateway } from '../gateways/socket.gateway';

export const notificationService = {
  createNotification: async (data: any) => {
    try {
      const recipientId = data.recipient?._id?.toString() || data.recipient?.toString();
      const actorId = data.actor?._id?.toString() || data.actor?.toString();

      if (!recipientId || !actorId || recipientId === actorId) return null;

      const newNotification = await Notification.findOneAndUpdate(
        { recipient: recipientId, actor: actorId, type: data.type, pickId: data.pickId },
        { ...data, read: false, createdAt: new Date() },
        { upsert: true, new: true }
      ).populate('actor', 'fullName profilePicture');

      // 🔥 REAL-TIME SIGNAL PUSH
      if (newNotification) {
        socketGateway.sendNotification(recipientId, newNotification);
      }

      return newNotification;
    } catch (error) {
      console.error("Notification Engine Error:", error);
      return null;
    }
  },

  async getUserNotifications(userId: string) {
    return await Notification.find({ recipient: userId })
      .populate('actor', 'fullName profilePicture')
      .populate('pickId', 'description mediaUrls') // Added mediaUrls to show a thumbnail in the UI
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(); // Use lean for faster read-only queries
  },

  /**
   * PROTOCOL COMPLIANT: Delete notification [2026-02-01]
   */
  async deleteNotification(notificationId: string, userId: string) {
    return await Notification.deleteOne({ _id: notificationId, recipient: userId });
  },

  async markAsRead(userId: string) {
    return await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
  }
};