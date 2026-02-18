import Pick, { IPick } from '../models/pick.model';

export const pickRepository = {
  async create(pickData: Partial<IPick>): Promise<IPick> {
    const newPick = new Pick(pickData);
    return await newPick.save();
  },

  async findById(id: string): Promise<IPick | null> {
    return (await Pick.findById(id)
      .populate("user", "fullName avatarUrl") // Join user data
      .lean()) as IPick | null;
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
      .populate("user", "fullName avatarUrl")
      .lean();
  },
  // Add this to your existing pickRepository object
  async update(
    pickId: string,
    userId: string,
    updateData: Partial<IPick>,
  ): Promise<IPick | null> {
    // We filter by both _id and user to ensure only the owner can modify it
    return (await Pick.findOneAndUpdate(
      { _id: pickId, user: userId },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()) as IPick | null;
  },

  async findByIdRaw(id: string): Promise<IPick | null> {
    return (await Pick.findById(id)
      .populate("user", "fullName avatarUrl")
      .lean()) as IPick | null;
  },
  async findByUser(userId: string, limit: number, skip: number) {
    return await Pick.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePicture fullName")
      .lean();
  },

  async countByUser(userId: string) {
    return await Pick.countDocuments({ user: userId });
  },

  async findAll(limit: number, skip: number) {
    return await Pick.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePicture")
      .lean();
  },

  async countAll() {
    return await Pick.countDocuments();
  },
};