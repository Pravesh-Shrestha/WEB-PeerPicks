import Pick, { IPick } from '../models/pick.model';

export const pickRepository = {
  async create(pickData: Partial<IPick>): Promise<IPick> {
    const newPick = new Pick(pickData);
    return await newPick.save();
  },

  async findById(id: string): Promise<IPick | null> {
    return await Pick.findById(id)
      .populate('user', 'fullName avatarUrl') // Join user data
      .lean() as IPick | null;
  },

  // STRICT DELETE: Ensures only the owner can delete their pick
  async delete(pickId: string, userId: string): Promise<boolean> {
    const result = await Pick.deleteOne({ _id: pickId, user: userId });
    return result.deletedCount > 0;
  },

  // Discovery Algorithm: Fetch top-level picks (not reviews of reviews)
  async getDiscoveryFeed(limit: number, skip: number) {
    return await Pick.find({ parentPick: null })
      .sort({ createdAt: -1 }) // Pinterest-style: latest first
      .skip(skip)
      .limit(limit)
      .populate('user', 'fullName avatarUrl')
      .lean();
  }
};