import mongoose from 'mongoose';

jest.mock('../../../repositories/place.repository');
jest.mock('../../../repositories/comment.repository', () => ({
  CommentRepository: jest.fn().mockImplementation(() => ({
    findByPickId: jest.fn().mockResolvedValue([]),
  })),
}));
jest.mock('../../../services/notification.service');

jest.mock('../../../repositories/pick.repository');
jest.mock('../../../repositories/social.repository');
jest.mock('../../../repositories/user.repository');

describe('PickService Unit Tests', () => {
  const mockId = new mongoose.Types.ObjectId().toString();
  const userHex = new mongoose.Types.ObjectId().toString();
  let pickService: typeof import('../../../services/pick.service').pickService;
  let pickRepository: typeof import('../../../repositories/pick.repository').pickRepository;
  let socialRepository: typeof import('../../../repositories/social.repository').socialRepository;
  let placeRepository: typeof import('../../../repositories/place.repository').placeRepository;
  let notificationService: typeof import('../../../services/notification.service').notificationService;
  let UserRepository: typeof import('../../../repositories/user.repository').UserRepository;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    ({ UserRepository } = await import('../../../repositories/user.repository'));
    ({ pickRepository } = await import('../../../repositories/pick.repository'));
    ({ socialRepository } = await import('../../../repositories/social.repository'));
    ({ placeRepository } = await import('../../../repositories/place.repository'));
    ({ notificationService } = await import('../../../services/notification.service'));

    const module = await import('../../../services/pick.service');
    pickService = module.pickService;

    // Configure the mocked UserRepository instance that pickService constructs
    const userRepoInstance = (UserRepository as unknown as jest.Mock).mock.instances[0];
    if (userRepoInstance) {
      userRepoInstance.getUserById = jest.fn().mockResolvedValue({ _id: mockId, fullName: 'Test User' });
      userRepoInstance.getFollowingIds = jest.fn().mockResolvedValue([]);
      userRepoInstance.isFollowing = jest.fn().mockResolvedValue(false);
    }

    // Default repository mocks
    (placeRepository.upsertPlace as jest.Mock).mockResolvedValue({ _id: 'place1' });
    (pickRepository.create as jest.Mock).mockResolvedValue({ _id: 'child' });
    (pickRepository.findById as jest.Mock).mockResolvedValue({ _id: mockId, user: mockId });
    (pickRepository.delete as jest.Mock).mockResolvedValue(true);
    (socialRepository.decrementCommentCount as jest.Mock).mockResolvedValue({});
    (socialRepository.incrementCommentCount as jest.Mock).mockResolvedValue({});
    (notificationService.createNotification as jest.Mock).mockResolvedValue({});
    (pickRepository.findByUser as jest.Mock).mockResolvedValue([{ _id: 'p1', user: mockId, upvotes: [] }]);
  });

  it('should decrement parent comment count when a reply-pick is deleted', async () => {
    const parentId = new mongoose.Types.ObjectId().toString();
    const childPick = { _id: mockId, parentPick: parentId };
    
    (pickRepository.findById as jest.Mock).mockResolvedValue(childPick);
    (pickRepository.delete as jest.Mock).mockResolvedValue(true);
    (socialRepository.decrementCommentCount as jest.Mock).mockResolvedValue({});

    const result = await pickService.deleteUserPick(mockId, 'user123');

    expect(result).toBe(true);
    expect(socialRepository.decrementCommentCount).toHaveBeenCalledWith(parentId);
  });

  it('createNewPick sends notification for comment replies', async () => {
    const place = { _id: 'place1' } as any;
    const parentPickId = new mongoose.Types.ObjectId().toString();
    const parentPick = { _id: parentPickId, user: new mongoose.Types.ObjectId('64b6e0f2e0e0e0e0e0e0e0e0') } as any;

    (placeRepository.upsertPlace as jest.Mock).mockResolvedValue(place);
    (pickRepository.create as jest.Mock).mockResolvedValue({ _id: 'child', parentPick: parentPickId });
    (socialRepository.incrementCommentCount as jest.Mock).mockResolvedValue({});
    (pickRepository.findById as jest.Mock).mockResolvedValue(parentPick);

    await pickService.createNewPick(userHex, { name: 'loc', category: 'c', alias: 'a', lat: 0, lng: 0 }, { parentPickId, description: 'd' });

    expect(notificationService.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'COMMENT' }));
    expect(socialRepository.incrementCommentCount).toHaveBeenCalledWith(parentPickId);
  });

  it('getDiscoveryFeed returns empty for following feed with no followees', async () => {
    jest.spyOn(UserRepository.prototype, 'getFollowingIds').mockResolvedValue([]);
    const userRepoInstance = (UserRepository as unknown as jest.Mock).mock.instances[0];
    if (userRepoInstance) {
      userRepoInstance.getFollowingIds = jest.fn().mockResolvedValue([]);
    }

    const res = await pickService.getDiscoveryFeed(1, 10, 'me', 'following');

    expect(res).toEqual([]);
  });

  it('getPickById throws when pick missing', async () => {
    (pickRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(pickService.getPickById('bad')).rejects.toThrow('Review not found.');
  });

  it('getPlaceHubDetails throws when place is missing', async () => {
    (placeRepository.findByLinkId as jest.Mock).mockResolvedValue(null);
    await expect(pickService.getPlaceHubDetails('link')).rejects.toThrow('Location link not found.');
  });

  it('getPicksByUser returns profile with follow flag', async () => {
    const mockUser = { _id: 'u1', toObject: () => ({ id: 'u1' }), followerCount: 1, followingCount: 2 } as any;
    jest.spyOn(UserRepository.prototype, 'getUserById').mockResolvedValue(mockUser);
    jest.spyOn(UserRepository.prototype, 'isFollowing').mockResolvedValue(false);
    const userRepoInstance = (UserRepository as unknown as jest.Mock).mock.instances[0];
    if (userRepoInstance) {
      userRepoInstance.getUserById = jest.fn().mockResolvedValue(mockUser);
      userRepoInstance.isFollowing = jest.fn().mockResolvedValue(false);
    }
    (pickRepository.findByUser as jest.Mock).mockResolvedValue([{ _id: 'p1', user: 'u1', upvotes: [] }]);

    const res = await pickService.getPicksByUser('u1', 'current');

    expect(res.profile.isFollowing).toBe(false);
    expect(res.picks).toBeDefined();
  });
});