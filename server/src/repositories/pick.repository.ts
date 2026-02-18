import Pick, { IPick } from '../models/pick.model';

export const pickRepository = {
  /**
   * CREATE: Saves a new social review.
   */
  async create(pickData: Partial<IPick>): Promise<IPick> {
    const newPick = new Pick(pickData);
    return await newPick.save();
  },

  /**
   * READ (Feed): Fetches the social discovery feed.
   * Populates user details for the Instagram-style header.
   */
  async getDiscoveryFeed(limit: number, skip: number) {
    return await Pick.find({ parentPick: null })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate("user", "fullName avatarUrl")
      .lean();
  },

  /**
   * READ (Single): Fetches a specific pick by ID.
   */
  async findById(id: string) {
    return await Pick.findById(id)
      .populate("user", "fullName avatarUrl")
      .lean();
  },

  /**
   * READ (User): Fetches all picks by a specific author.
   */
  async findByUser(userId: string) {
    return await Pick.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "fullName avatarUrl");
  },

  /**
   * READ (Hub): Fetches all community reviews for a specific Google Link.
   * This allows users to see everyone who has reviewed the same spot.
   */
  async findByPlace(placeLinkId: string) {
    return await Pick.find({ place: placeLinkId })
      .populate("user", "fullName avatarUrl")
      .sort({ createdAt: -1 });
  },

  /**
   * UPDATE: Only updates if the user is the owner.
   */
  async update(pickId: string, userId: string, data: Partial<IPick>) {
    return await Pick.findOneAndUpdate(
      { _id: pickId, user: userId }, // Strict ownership check
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  /**
   * DELETE: Strictly owner-only removal.
   * Using 'delete' terminology as per design instructions.
   */
  async delete(pickId: string, userId: string): Promise<boolean> {
    const result = await Pick.deleteOne({ _id: pickId, user: userId });
    return result.deletedCount > 0;
  },

  /**
   * READ: Fetches picks by category for filtering.
   */
  async findByCategory(category: string, limit: number, skip: number) {
    return await Pick.find({ category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "fullName avatarUrl")
      .lean();
  },

  async findAllPicks() {
    return await Pick.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName avatarUrl")
      .lean();
  }
};