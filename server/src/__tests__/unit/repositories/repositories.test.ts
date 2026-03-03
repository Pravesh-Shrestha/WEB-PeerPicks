import { Types } from 'mongoose';

// Mocks
jest.mock('../../../models/comment.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('../../../models/notification.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('../../../models/pick.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    aggregate: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock('../../../models/place.model', () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../../models/user.model', () => {
  const ctor: any = jest.fn(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ ...data, _id: 'u1' });
  });
  ctor.findOne = jest.fn();
  ctor.findById = jest.fn();
  ctor.findByIdAndUpdate = jest.fn();
  ctor.findByIdAndDelete = jest.fn();
  ctor.find = jest.fn();
  ctor.countDocuments = jest.fn();
  return { __esModule: true, UserModel: ctor };
});

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    startSession: jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
  };
});

import Comment from '../../../models/comment.model';
import Notification from '../../../models/notification.model';
import Pick from '../../../models/pick.model';
import Place from '../../../models/place.model';
import { UserModel } from '../../../models/user.model';

import { CommentRepository } from '../../../repositories/comment.repository';
import { notificationRepository } from '../../../repositories/notification.repository';
import { pickRepository } from '../../../repositories/pick.repository';
import { placeRepository } from '../../../repositories/place.repository';
import { socialRepository } from '../../../repositories/social.repository';
import { UserRepository } from '../../../repositories/user.repository';

const asMock = <T>(fn: any) => fn as jest.Mocked<T>;
const commentModel = Comment as unknown as {
  create: jest.Mock;
  find: jest.Mock;
  findOneAndUpdate: jest.Mock;
};
const notificationModel = Notification as unknown as {
  create: jest.Mock;
  find: jest.Mock;
  countDocuments: jest.Mock;
  updateMany: jest.Mock;
  deleteOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
};
const pickModel = Pick as unknown as {
  create: jest.Mock;
  aggregate: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
  findOneAndUpdate: jest.Mock;
  deleteOne: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  updateOne: jest.Mock;
};
const placeModel = Place as unknown as {
  findOneAndUpdate: jest.Mock;
  findOne: jest.Mock;
};
const userModel = UserModel as unknown as jest.Mocked<any>;

describe('Repository unit coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('CommentRepository.create delegates to model', async () => {
    commentModel.create.mockResolvedValue({ _id: '1' });
    const repo = new CommentRepository();
    const res = await repo.create({ content: 'hi' } as any);
    expect(commentModel.create).toHaveBeenCalledWith({ content: 'hi' });
    expect(res).toEqual({ _id: '1' });
  });

  it('CommentRepository.findByPickId builds query with ObjectId', async () => {
    const sort = jest.fn().mockResolvedValue([{ id: 1 }]);
    const populate = jest.fn().mockReturnValue({ sort });
    commentModel.find.mockReturnValue({ populate });
    const repo = new CommentRepository();
    const res = await repo.findByPickId('64b6e0f2e0e0e0e0e0e0e0e0');
    expect(commentModel.find).toHaveBeenCalledWith({ pick: expect.any(Types.ObjectId) });
    expect(populate).toHaveBeenCalledWith('author', 'fullName profilePicture');
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(res).toEqual([{ id: 1 }]);
  });

  it('CommentRepository.delete soft-deletes by author', async () => {
    commentModel.findOneAndUpdate.mockResolvedValue({ ok: true });
    const repo = new CommentRepository();
    await repo.delete('cid', 'aid');
    expect(commentModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'cid', author: 'aid' },
      { isDeleted: true },
      { new: true },
    );
  });

  it('NotificationRepository.createWelcomeNotification sets defaults', async () => {
    notificationModel.create.mockResolvedValue({ _id: 'nid' });
    const res = await notificationRepository.createWelcomeNotification('64b6e0f2e0e0e0e0e0e0e0e0');
    expect(notificationModel.create).toHaveBeenCalledWith(expect.objectContaining({
      recipient: expect.any(Types.ObjectId),
      type: 'WELCOME',
      read: false,
    }));
    expect(res).toEqual({ _id: 'nid' });
  });

  it('NotificationRepository.findByUserId maps fallback messages', async () => {
    const lean = jest.fn().mockResolvedValue([
      { type: 'WELCOME', message: '', actor: null },
    ]);
    const limit = jest.fn().mockReturnValue({ lean });
    const sort = jest.fn().mockReturnValue({ limit });
    const populate = jest.fn().mockReturnValue({ sort });
    notificationModel.find.mockReturnValue({ populate });

    const list = await notificationRepository.findByUserId('64b6e0f2e0e0e0e0e0e0e0e0', 5);
    expect(notificationModel.find).toHaveBeenCalledWith({ recipient: expect.any(Types.ObjectId) });
    expect(limit).toHaveBeenCalledWith(5);
    expect(list[0].message).toBe('Welcome to PeerPicks! Your node is active.');
    expect(list[0].actorName).toBe('PEERPICKS_TEAM');
  });

  it('NotificationRepository.upsertSocialNotification forces recipient', async () => {
    const lean = jest.fn().mockResolvedValue({ ok: 1 });
    const populate = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ lean }) });
    notificationModel.findOneAndUpdate.mockReturnValue({ populate });

    const res = await notificationRepository.upsertSocialNotification(
      { type: 'VOTE' },
      { recipient: 'uid', actor: 'aid' },
    );
    expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ recipient: 'uid' }),
      expect.objectContaining({ read: false }),
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    expect(res).toEqual({ ok: 1 });
  });

  it('PickRepository.delete returns boolean', async () => {
    pickModel.deleteOne.mockResolvedValue({ deletedCount: 0 });
    const deleted = await pickRepository.delete('pid', 'uid');
    expect(deleted).toBe(false);
  });

  it('PickRepository.addUpvote syncs counts', async () => {
    const syncSpy = jest.spyOn(pickRepository as any, '_syncVoteCounts').mockResolvedValue({ ok: 1 } as any);
    pickModel.findByIdAndUpdate.mockResolvedValue({ _id: 'p1', upvotes: ['u1'] });

    const res = await pickRepository.addUpvote('p1', 'u1');

    expect(pickModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(syncSpy).toHaveBeenCalled();
    expect(res).toEqual({ ok: 1 });
  });

  it('PickRepository.addDownvote syncs counts', async () => {
    const syncSpy = jest.spyOn(pickRepository as any, '_syncVoteCounts').mockResolvedValue({ ok: 2 } as any);
    pickModel.findByIdAndUpdate.mockResolvedValue({ _id: 'p1', downvotes: ['u1'] });

    const res = await pickRepository.addDownvote('p1', 'u1');

    expect(syncSpy).toHaveBeenCalled();
    expect(res).toEqual({ ok: 2 });
  });

  it('PickRepository.removeVote clears both arrays', async () => {
    const syncSpy = jest.spyOn(pickRepository as any, '_syncVoteCounts').mockResolvedValue({ ok: 3 } as any);
    pickModel.findByIdAndUpdate.mockResolvedValue({ _id: 'p1', upvotes: [], downvotes: [] });

    const res = await pickRepository.removeVote('p1', 'u1');

    expect(pickModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'p1',
      { $pull: { upvotes: 'u1', downvotes: 'u1' } },
      { new: true },
    );
    expect(syncSpy).toHaveBeenCalled();
    expect(res).toEqual({ ok: 3 });
  });

  it('PickRepository.findById returns null on invalid id', async () => {
    const res = await pickRepository.findById('bad-id');
    expect(res).toBeNull();
  });

  it('PickRepository._syncVoteCounts returns null if doc missing', async () => {
    const res = await pickRepository._syncVoteCounts(null as any);
    expect(res).toBeNull();
  });

  it('PickRepository._syncVoteCounts updates when doc present', async () => {
    pickModel.findByIdAndUpdate.mockResolvedValue({ _id: 'p1', upvoteCount: 1 });
    const res = await pickRepository._syncVoteCounts({ _id: 'p1', upvotes: [1], downvotes: [] } as any);
    expect(res).toEqual({ _id: 'p1', upvoteCount: 1 });
  });

  it('PickRepository.getDiscoveryFeed builds aggregate pipeline', async () => {
    pickModel.aggregate.mockResolvedValue(['ok']);
    const res = await pickRepository.getDiscoveryFeed(2, 0, ['64b6e0f2e0e0e0e0e0e0e0e0'], ['64b6e0f2e0e0e0e0e0e0e0e0']);
    expect(Array.isArray(res)).toBe(true);
    expect(Pick.aggregate).toHaveBeenCalled();
  });

  it('PickRepository.findByPlace delegates to model', async () => {
    pickModel.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn() }) });
    await pickRepository.findByPlace('place');
    expect(pickModel.find).toHaveBeenCalledWith({ place: 'place', parentPick: null });
  });

  it('PickRepository.findByCategory builds query chain', async () => {
    const lean = jest.fn().mockResolvedValue(['ok']);
    const populate = jest.fn().mockReturnValue({ lean });
    const limit = jest.fn().mockReturnValue({ populate });
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });
    pickModel.find.mockReturnValue({ sort });

    const res = await pickRepository.findByCategory('cat', 5, 0);
    expect(res).toEqual(['ok']);
    expect(pickModel.find).toHaveBeenCalledWith({ category: 'cat', parentPick: null });
  });

  it('PickRepository.getMediaVault filters by mediaUrls', async () => {
    const lean = jest.fn().mockResolvedValue(['media']);
    const limit = jest.fn().mockReturnValue({ lean });
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });
    const select = jest.fn().mockReturnValue({ sort });
    pickModel.find.mockReturnValue({ select });

    const res = await pickRepository.getMediaVault('user', 10, 0);
    expect(res).toEqual(['media']);
    expect(select).toHaveBeenCalledWith('mediaUrls createdAt place alias');
  });

  it('PickRepository.findRandomPicks uses aggregate', async () => {
    pickModel.aggregate.mockResolvedValue(['random']);
    const res = await pickRepository.findRandomPicks(3, ['64b6e0f2e0e0e0e0e0e0e0e0']);
    expect(res).toEqual(['random']);
    expect(pickModel.aggregate).toHaveBeenCalled();
  });

  it('PlaceRepository.upsertPlace uses placeId filter', async () => {
    placeModel.findOneAndUpdate.mockResolvedValue({ _id: 'p1' });
    const res = await placeRepository.upsertPlace({ placeId: 'g123', name: 'Cafe' } as any);
    expect(Place.findOneAndUpdate).toHaveBeenCalledWith(
      { placeId: 'g123' },
      { $set: { placeId: 'g123', name: 'Cafe' } },
      { upsert: true, new: true, runValidators: true },
    );
    expect(res).toEqual({ _id: 'p1' });
  });

  it('PlaceRepository.findByLinkId delegates to model', async () => {
    placeModel.findOne.mockResolvedValue({ _id: 'p1' });
    const res = await placeRepository.findByLinkId('link');
    expect(res).toEqual({ _id: 'p1' });
    expect(placeModel.findOne).toHaveBeenCalledWith({ placeId: 'link' });
  });

  it('SocialRepository.toggleUpvote toggles add/remove', async () => {
    const updateOne = pickModel.updateOne;
    updateOne.mockResolvedValueOnce({ modifiedCount: 0 }); // no pull, so add
    updateOne.mockResolvedValueOnce({});
    pickModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ upvoteCount: 3 }) });
    const res = await socialRepository.toggleUpvote('64b6e0f2e0e0e0e0e0e0e0e0', '64b6e0f2e0e0e0e0e0e0e0e1');
    expect(res).toEqual({ success: true, status: true, count: 3, action: 'signaled' });
  });

  it('SocialRepository.decrementCommentCount guards below zero', async () => {
    pickModel.findOneAndUpdate.mockResolvedValue({ ok: true });
    const res = await socialRepository.decrementCommentCount('p1');
    expect(res).toEqual({ ok: true });
    expect(pickModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'p1', commentCount: { $gt: 0 } },
      { $inc: { commentCount: -1 } },
      { new: true },
    );
  });

  it('UserRepository.findByEmail lowercases input', async () => {
    userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const repo = new UserRepository();
    await repo.findByEmail('  USER@Mail.Com ');
    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'user@mail.com' });
  });

  it('UserRepository.create normalizes email', async () => {
    const repo = new UserRepository();
    userModel.mockImplementationOnce((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...data, _id: 'u1', email: 'test@mail.com' }),
    }));
    const user = await repo.create({ email: 'Test@Mail.Com' });
    expect(user.email).toBe('test@mail.com');
  });

  it('UserRepository.isFollowing returns boolean from countDocuments', async () => {
    userModel.countDocuments.mockResolvedValue(1);
    const repo = new UserRepository();
    const res = await repo.isFollowing('f', 't');
    expect(res).toBe(true);
    expect(userModel.countDocuments).toHaveBeenCalledWith({ _id: 'f', following: 't' });
  });

  it('UserRepository.getFollowingIds returns [] when missing', async () => {
    userModel.findById.mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue({}) });
    const repo = new UserRepository();
    const res = await repo.getFollowingIds('u1');
    expect(res).toEqual([]);
  });

  it('UserRepository.updateUser lowercases email and sets options', async () => {
    userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ email: 'new@mail.com' }) });
    const repo = new UserRepository();
    await repo.updateUser('u1', { email: 'New@Mail.Com' });

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { email: 'new@mail.com' },
      { new: true, runValidators: true },
    );
  });

  it('UserRepository.deleteUser delegates to model', async () => {
    userModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue({ ok: 1 }) });
    const repo = new UserRepository();
    const res = await repo.deleteUser('u1');
    expect(res).toEqual({ ok: 1 });
    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('u1');
  });

  it('UserRepository.getAllUsers selects without password and sorts', async () => {
    const sort = jest.fn().mockResolvedValue(['u1']);
    const select = jest.fn().mockReturnValue({ sort });
    userModel.find.mockReturnValue({ select });

    const repo = new UserRepository();
    const res = await repo.getAllUsers();

    expect(select).toHaveBeenCalledWith('-password');
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res).toEqual(['u1']);
  });

  it('UserRepository.follow/unfollow delegate to updateSocialConnection', async () => {
    const repo = new UserRepository();
    const spy = jest.spyOn(repo as any, 'updateSocialConnection').mockResolvedValue(undefined);

    await repo.follow('f', 't');
    await repo.unfollow('f', 't');

    expect(spy).toHaveBeenCalledWith('f', 't', true);
    expect(spy).toHaveBeenCalledWith('f', 't', false);
  });

  it('UserRepository.updateSocialConnection falls back when transactions unsupported', async () => {
    const repo = new UserRepository();
    const session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    const mongoose = require('mongoose');
    mongoose.startSession.mockResolvedValue(session);

    const txnError: any = new Error('txn');
    txnError.code = 20;

    userModel.findByIdAndUpdate
      .mockImplementationOnce(() => { throw txnError; })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await expect((repo as any).updateSocialConnection('f', 't', true)).resolves.not.toThrow();

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('f', expect.any(Object));
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('t', expect.any(Object));
  });
});