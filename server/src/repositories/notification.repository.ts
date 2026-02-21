import Notification from "../models/notification.model";

export const notificationRepository = {
  async create(data: any) {
    return await Notification.create(data);
  },

  async findByUser(userId: string) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("issuer", "fullName profilePicture")
      .populate("pickId", "description")
      .limit(50);
  },

  /**
   * PROTOCOL: Delete instead of Purge [2026-02-01]
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