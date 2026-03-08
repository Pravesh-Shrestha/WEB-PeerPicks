// src/__tests__/unit/services/social.service.test.ts
import { socialService } from '../../../services/social.service';
import { notificationService } from '../../../services/notification.service';
import { pickRepository } from '../../../repositories/pick.repository';
import { socialRepository } from '../../../repositories/social.repository';

jest.mock('../../../services/notification.service');
jest.mock('../../../repositories/pick.repository');
jest.mock('../../../repositories/social.repository');

describe('SocialService Unit Tests', () => {
  it('should trigger a notification when an upvote is successful', async () => {
    const userId = 'user1';
    const pickId = 'pick1';
    const pickOwnerId = 'owner1';

    (socialRepository.toggleUpvote as jest.Mock).mockResolvedValue({ status: true });
    (pickRepository.findById as jest.Mock).mockResolvedValue({ _id: pickId, user: pickOwnerId });

    await socialService.handleUpvote(userId, pickId);

    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'VOTE',
        recipient: pickOwnerId,
        actor: userId
      })
    );
  });

  it('handleComment throws when pick missing', async () => {
    (pickRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(socialService.handleComment('u1', 'missing', 'hi')).rejects.toThrow('Target pick not found.');
  });

  it('handleComment notifies owner and increments count', async () => {
    (pickRepository.findById as jest.Mock).mockResolvedValue({ _id: 'p1', user: 'owner1' });
    (socialRepository.incrementCommentCount as jest.Mock).mockResolvedValue({});

    const res = await socialService.handleComment('commenter', 'p1', 'hello');

    expect(res).toEqual({ success: true });
    expect(notificationService.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'COMMENT' }));
    expect(socialRepository.incrementCommentCount).toHaveBeenCalledWith('p1');
  });

  it('handleSave errors when pick not found', async () => {
    (pickRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(socialService.handleSave('u1', 'missing')).rejects.toThrow('Pick not found.');
  });
});