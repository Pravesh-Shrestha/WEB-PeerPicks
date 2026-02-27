import { notificationService } from '../../../services/notification.service';
import { notificationRepository } from '../../../repositories/notification.repository';
import { notificationController } from '../../../controllers/notification.controller';
import mongoose from 'mongoose';

jest.mock('../../../repositories/notification.repository');
jest.mock('../../../controllers/notification.controller');

describe('NotificationService Unit Tests', () => {
  const recipientId = new mongoose.Types.ObjectId().toString();
  const actorId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prevent self-notifications for social interactions', async () => {
    const result = await notificationService.createNotification({
      recipient: recipientId,
      actor: recipientId,
      type: 'VOTE'
    });

    expect(result).toBeNull();
    expect(notificationRepository.upsertSocialNotification).not.toHaveBeenCalled();
  });

  it('should broadcast notification via SSE when created', async () => {
    const mockNotif = {
      recipient: recipientId,
      type: 'COMMENT',
      actor: { fullName: 'John Doe' },
      message: 'broadcasted a new signal'
    };

    (notificationRepository.upsertSocialNotification as jest.Mock).mockResolvedValue(mockNotif);

    await notificationService.createNotification({
      recipient: recipientId,
      actor: actorId,
      type: 'COMMENT'
    });

    expect(notificationController.broadcastToUser).toHaveBeenCalledWith(
      recipientId,
      expect.objectContaining({ actorName: 'John Doe' })
    );
  });

  it('should use the 2026-02-01 "delete" terminology', async () => {
    (notificationRepository.deleteById as jest.Mock).mockResolvedValue(true);
    
    const result = await notificationService.deleteSignal('notif123', 'user123');
    
    expect(result).toBe(true);
    expect(notificationRepository.deleteById).toHaveBeenCalled();
  });
});

