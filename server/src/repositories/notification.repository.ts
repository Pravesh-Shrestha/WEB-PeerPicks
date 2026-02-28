import Notification from '../models/notification.model';
import { Types } from 'mongoose';

export const notificationRepository = {
  /**
   * INITIALIZE NODE: Creates a welcome signal for new users.
   * This ensures the feed isn't empty upon first login and tests isolation.
   */
  async createWelcomeNotification(userId: string) {
    return await Notification.create({
      recipient: new Types.ObjectId(userId),
      // For welcome, the system acts as the actor
      type: "WELCOME",
      message: "Welcome to PeerPicks! Your node is active and ready for signals.",
      read: false,
    });
  },


  /**
   * Fetches the signal feed.
   * VETERAN FIX: Enhanced to ensure we don't send broken nodes to the frontend.
   */
  async findByUserId(userId: string, limit: number = 20) {
    const notifications = await Notification.find({
      recipient: new Types.ObjectId(userId),
    })
      .populate("actor", "fullName profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications.map((n: any) => {
      let fallbackText = n.message || "";

      if (!fallbackText) {
        if (n.type === "VOTE") fallbackText = "upvoted your pick";
        if (n.type === "COMMENT") fallbackText = "replied to your review";
        if (n.type === "SAVE") fallbackText = "bookmarked your content";
        if (n.type === "WELCOME")fallbackText = "Welcome to PeerPicks! Your node is active.";
        if (n.type === "SYSTEM") fallbackText = "System maintenance alert.";
      }

      return {
        ...n,
        message: fallbackText,
        actorName:
          n.actor?.fullName ||
          (n.type === "WELCOME" ? "PEERPICKS_TEAM" : "SYSTEM_NODE"),
      };
    });
  },

  async getUnreadCount(userId: string) {
    return await Notification.countDocuments({
      recipient: new Types.ObjectId(userId),
      read: false,
    });
  },

  async markAllAsRead(userId: string) {
    return await Notification.updateMany(
      { recipient: new Types.ObjectId(userId), read: false },
      { $set: { read: true } },
    );
  },

  /**
   * PROTOCOL COMPLIANT: Delete logic [2026-02-01]
   * Explicitly uses "delete" terminology as per project constraints.
   */
  async deleteById(id: string, userId: string) {
    return await Notification.deleteOne({
      _id: new Types.ObjectId(id),
      recipient: new Types.ObjectId(userId),
    });
  },

  /**
   * UPSERT SOCIAL SIGNAL:
   * VETERAN MOVE: Always include recipient in the query to prevent "Nick vs Pravesh" 
   * data leakage in local environments.
   */
  async upsertSocialNotification(query: any, data: any) {
    const secureQuery = {
      ...query,
      recipient: data.recipient, // Force isolation within the database query
    };

    const notification = await Notification.findOneAndUpdate(
      secureQuery,
      {
        ...data,
        read: false,
        createdAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
      .populate("actor", "fullName profilePicture")
      .populate("pickId", "description mediaUrls")
      .lean();

    return notification;
  },
};