import { notificationController } from '../controllers/notification.controller';
import { notificationRepository } from '../repositories/notification.repository';
import { Types } from 'mongoose';
import { INotification, IPopulatedActor } from '../models/notification.model';

export const notificationService = {
  /**
   * Primary method for creating any signal (Social, Welcome, or System)
   * Integrates DB persistence with Real-time SSE Broadcast.
   */
  async createNotification(data: any) {
    const recipientId = data.recipient?.toString();
    const actorId = data.actor?.toString();

    // 1. Prevent self-notifications unless it's a Welcome/System message
    if (recipientId === actorId && !['WELCOME', 'SYSTEM'].includes(data.type)) {
      return null;
    }

    if (!recipientId) {
      console.warn("[NOTIFY_SKIP] Missing recipient for", data.type, data.pickId || "no-pick-id");
      return null;
    }

    // 2. Build uniqueness query for upsertion
    // Casting to Types.ObjectId ensures schema compatibility
    const query: any = {
      recipient: new Types.ObjectId(recipientId),
      type: data.type,
      pickId: data.pickId ? new Types.ObjectId(data.pickId) : undefined,
    };

    if (data.type !== 'COMMENT') {
    query.actor = new Types.ObjectId(actorId);
    } else {
      query._id = new Types.ObjectId(); // Forces a new record every time for comments
    }

    // 3. Persist to Database via Repository
    const finalData = {
      ...data,
      recipient: new Types.ObjectId(recipientId),
      actor: actorId ? new Types.ObjectId(actorId) : undefined,
      pickId: data.pickId ? new Types.ObjectId(data.pickId) : undefined,
      message: data.message || this.generateFallbackMessage(data.type),
      status: data.status || this.getStatusMap(data.type)
    };

    // Ensure COMMENT notifications always carry actor for UI rendering
    if (data.type === 'COMMENT' && !finalData.actor && actorId) {
      finalData.actor = new Types.ObjectId(actorId);
    }

    // Repository populates 'actor' internally
    const notification = await notificationRepository.upsertSocialNotification(query, finalData);

    // 4. SSE REAL-TIME BROADCAST
    if (notification && recipientId) {
      // FIX: Explicitly cast actor to IPopulatedActor to resolve TypeScript errors
      const actor = notification.actor as unknown as IPopulatedActor;
      
      const broadcastPayload = {
        ...notification,
        // Reporting: Ensure the author's name is extracted from the populated object
        actorName: actor?.fullName || (notification as any).actorName || "A Peer",
        message: notification.message || finalData.message
      };

      notificationController.broadcastToUser(recipientId, broadcastPayload);
      
      return broadcastPayload;
    }

    return notification;
  },

  /**
   * Maps notification types to UI status colors
   */
  getStatusMap(type: string): string {
    const maps: Record<string, string> = {
      VOTE: 'success',
      COMMENT: 'info',
      SAVE: 'warning',
      FOLLOW: 'success',
      WELCOME: 'success',
      SYSTEM: 'info'
    };
    return maps[type] || 'info';
  },

  /**
   * Helper: Standardizes strings as per [2026-02-01] requirements.
   */
  generateFallbackMessage(type: string) {
    switch (type) {
      case 'VOTE': return 'upvoted your pick.';
      case 'COMMENT': return 'broadcasted a new signal on your pick.'; // Updated term
      case 'SAVE': return 'saved your pick.';
      case 'FOLLOW': return 'started following you.';
      case 'WELCOME': return 'Welcome to PeerPicks! Your node is active.';
      default: return 'New signal received.';
    }
  },

  async getUserSignals(userId: string) {
    return await notificationRepository.findByUserId(userId);
  },

  async getUnreadSignalCount(userId: string) {
    return await notificationRepository.getUnreadCount(userId);
  },

  /**
   * PROTOCOL COMPLIANT: Delete Signal [2026-02-01]
   * Explicitly uses "delete" terminology as per project constraints.
   */
  async deleteSignal(id: string, userId: string) {
    return await notificationRepository.deleteById(id, userId);
  },

  async syncReadStatus(userId: string) {
    return await notificationRepository.markAllAsRead(userId);
  }
};