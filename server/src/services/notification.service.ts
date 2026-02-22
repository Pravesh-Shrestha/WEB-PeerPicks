import { notificationController } from '../controllers/notification.controller';
import { notificationRepository } from '../repositories/notification.repository';

export const notificationService = {
  /**
   * Primary method for creating any signal (Social, Welcome, or System)
   * Integrates DB persistence with Real-time SSE Broadcast.
   */
  async createNotification(data: any) {
    const recipientId = data.recipient?.toString();
    const actorId = data.actor?.toString();

    // 1. Prevent self-notifications unless it's a Welcome/System message
    if (recipientId === actorId && !['WELCOME', 'SYSTEM'].includes(data.type)) return null;

    // 2. Build uniqueness query to prevent signal spam (Upsert logic)
    // For System/Welcome, we use the message itself as part of the uniqueness check
    const query = {
      recipient: recipientId,
      type: data.type,
      ...(actorId && { actor: actorId }),
      ...(data.pickId && { pickId: data.pickId }),
      ...(data.type === 'SYSTEM' && { message: data.message })
    };

    // 3. Persist to Database via Repository
    // This returns a lean, populated object
    const notification = await notificationRepository.upsertSocialNotification(query, data);

    // 4. SSE REAL-TIME BROADCAST
    if (notification) {
      // Map notification types to UI status colors for the Sonner toast
      const statusMap: Record<string, string> = {
        VOTE: 'success',
        COMMENT: 'info',
        SAVE: 'warning',
        WELCOME: 'success',
        SYSTEM: 'info'
      };

      /**
       * VETERAN FIX: Ensure 'message' is never null for the frontend.
       * If the DB didn't have a message but it's a known type, we provide the fallback
       * string here so the SSE broadcast carries the text.
       */
      const broadcastPayload = {
        ...notification,
        status: data.status || statusMap[data.type] || 'info',
        message: notification.message || data.message || this.generateFallbackMessage(notification)
      };

      notificationController.broadcastToUser(recipientId, broadcastPayload);
      
      // Return the payload with the message for any immediate caller logic
      return broadcastPayload;
    }

    return notification;
  },

  /**
   * Helper to ensure the "No Text" issue is killed at the source.
   */
  generateFallbackMessage(n: any) {
    switch (n.type) {
      case 'VOTE': return 'upvoted your pick';
      case 'COMMENT': return 'replied to your review';
      case 'SAVE': return 'bookmarked your content';
      case 'FOLLOW': return 'started following you';
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
   */
  async deleteSignal(id: string, userId: string) {
    return await notificationRepository.deleteById(id, userId);
  },

  async syncReadStatus(userId: string) {
    return await notificationRepository.markAllAsRead(userId);
  }
};