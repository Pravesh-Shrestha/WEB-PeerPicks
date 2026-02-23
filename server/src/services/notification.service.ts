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
    if (recipientId === actorId && !['WELCOME', 'SYSTEM'].includes(data.type)) {
      return null;
    }

    // 2. Build uniqueness query to prevent signal spam (Upsert logic)
    // For social types (VOTE, COMMENT, SAVE), we group by actor and pickId.
    // For WELCOME, it's unique to the recipient.
    const query: any = {
      recipient: recipientId,
      type: data.type,
      actor: actorId,
      pickId: data.pickId,
    };

    if (actorId) query.actor = actorId;
    if (data.pickId) query.pickId = data.pickId;
    
    // For System/Welcome, include the message in the uniqueness check if provided
    if (['SYSTEM', 'WELCOME'].includes(data.type) && data.message) {
      query.message = data.message;
    }

    // 3. Persist to Database via Repository
    // We pass the specific message requested or generate the fallback
    const finalData = {
      ...data,
      message: data.message || this.generateFallbackMessage(data.type)
    };

    const notification = await notificationRepository.upsertSocialNotification(query, finalData);

    // 4. SSE REAL-TIME BROADCAST
    if (notification) {
      const statusMap: Record<string, string> = {
        VOTE: 'success',
        COMMENT: 'info',
        SAVE: 'warning',
        WELCOME: 'success',
        SYSTEM: 'info'
      };

      const broadcastPayload = {
        ...notification,
        status: data.status || statusMap[data.type] || 'info',
        // Ensure the broadcast carries the same standardized message
        message: notification.message || finalData.message
      };

      notificationController.broadcastToUser(recipientId, broadcastPayload);
      
      return broadcastPayload;
    }

    return notification;
  },

  /**
   * Helper: Standardizes strings as per [2026-02-01] requirements.
   */
  generateFallbackMessage(type: string) {
    switch (type) {
      case 'VOTE': return 'upvoted your pick.';
      case 'COMMENT': return 'commented on your pick.';
      case 'SAVE': return 'save your pick.';
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
   */
  async deleteSignal(id: string, userId: string) {
    return await notificationRepository.deleteById(id, userId);
  },

  async syncReadStatus(userId: string) {
    return await notificationRepository.markAllAsRead(userId);
  }
};