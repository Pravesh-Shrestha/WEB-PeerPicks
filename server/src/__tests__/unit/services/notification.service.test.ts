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

  it('should return null when recipient is missing', async () => {
    const res = await notificationService.createNotification({ type: 'VOTE' });
    expect(res).toBeNull();
    expect(notificationRepository.upsertSocialNotification).not.toHaveBeenCalled();
  });

  it('should generate fallback message and status when missing', async () => {
    (notificationRepository.upsertSocialNotification as jest.Mock).mockResolvedValue({
      actor: { fullName: 'Zed' },
      message: '',
      type: 'VOTE',
    });

    await notificationService.createNotification({
      recipient: recipientId,
      actor: actorId,
      type: 'VOTE',
    });

    expect(notificationRepository.upsertSocialNotification).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ message: 'upvoted your pick.', status: 'success' })
    );
  });

  it('COMMENT notifications force actor id and broadcast', async () => {
    (notificationRepository.upsertSocialNotification as jest.Mock).mockResolvedValue({
      actor: undefined,
      type: 'COMMENT',
      message: 'x',
    });

    await notificationService.createNotification({
      recipient: recipientId,
      actor: actorId,
      type: 'COMMENT',
    });

    expect(notificationRepository.upsertSocialNotification).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ actor: expect.any(mongoose.Types.ObjectId) })
    );
  });

  it('getUserSignals proxies to repository', async () => {
    (notificationRepository.findByUserId as jest.Mock).mockResolvedValue(['ok']);
    const data = await notificationService.getUserSignals('uid');
    expect(data).toEqual(['ok']);
    expect(notificationRepository.findByUserId).toHaveBeenCalledWith('uid');
  });

  it('getUnreadSignalCount proxies to repository', async () => {
    (notificationRepository.getUnreadCount as jest.Mock).mockResolvedValue(3);
    const count = await notificationService.getUnreadSignalCount('uid');
    expect(count).toBe(3);
    expect(notificationRepository.getUnreadCount).toHaveBeenCalledWith('uid');
  });

  it('syncReadStatus proxies to repository', async () => {
    await notificationService.syncReadStatus('uid');
    expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith('uid');
  });

  it('should use the 2026-02-01 "delete" terminology', async () => {
    (notificationRepository.deleteById as jest.Mock).mockResolvedValue(true);
    
    const result = await notificationService.deleteSignal('notif123', 'user123');
    
    expect(result).toBe(true);
    expect(notificationRepository.deleteById).toHaveBeenCalled();
  });

  it('maps unknown types to default status and message', () => {
    expect(notificationService.getStatusMap('UNKNOWN')).toBe('info');
    expect(notificationService.generateFallbackMessage('UNKNOWN')).toBe('New signal received.');
  });
});

