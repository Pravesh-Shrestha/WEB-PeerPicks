import Notification from '../models/notification.model';
import { HttpError } from '../errors/http-error';

export const notificationService = {
  /**
   * CREATE: Generates a new system alert.
   * We don't throw errors here to ensure the main action (like voting) 
   * doesn't fail just because a notification couldn't be saved.
   */
  createNotification: async (data: any) => {
    try {
      // Force conversion to string if possible, or use the ID property
      const recipientId = data.recipient?._id?.toString() || data.recipient?.toString();
      const actorId = data.actor?._id?.toString() || data.actor?.toString();

      if (!recipientId || !actorId) return null;

      return await Notification.create({
        ...data,
        recipient: recipientId,
        actor: actorId
      });
    } catch (error) {
      // This console.log is what you're seeing in your terminal
      console.error("Notification Engine Error:", error);
      return null; // Return null so the controller continues
    }
  },

  /**
   * READ: Fetch alerts for the current Node.
   */
  async getUserNotifications(userId: string) {
    return await Notification.find({ recipient: userId })
      .populate('actor', 'fullName profilePicture') // Hydrate actor details
      .populate('pickId', 'description')            // Context for the alert
      .sort({ createdAt: -1 })
      .limit(20);
  },

  /**
   * UPDATE: Mark all as read
   */
  async markAsRead(userId: string) {
    return await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
  }
};