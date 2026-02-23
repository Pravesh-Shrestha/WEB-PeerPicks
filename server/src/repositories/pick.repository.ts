import Pick, { IPick } from "../models/pick.model";
import mongoose, { Types } from "mongoose";

export const pickRepository = {
  /**
   * CREATE: Saves a new social review or discussion comment.
   */
  async create(pickData: Partial<IPick>): Promise<IPick> {
    const newPick = new Pick(pickData);
    return await newPick.save();
  },

  /**
   * REVISED: Randomized Discovery Feed
   */
  async getDiscoveryFeed(limit: number, skip: number, excludeIds: string[] = []) {
    return await Pick.aggregate([
      // 1. Filter only main posts (no replies)
      { 
        $match: { 
          parentPick: null, 
          _id: { $nin: excludeIds.map(id => new Types.ObjectId(id)) } 
        } 
      },

      { $sample: { size: limit + skip } },
      { $skip: skip },
      { $limit: limit },

      // 2. JOIN USER DATA (Crucial for fullName and profilePicture)
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      // 3. JOIN PLACE DATA
      {
        $lookup: {
          from: "places",
          localField: "place",
          foreignField: "_id",
          as: "placeDetails",
        },
      },
      { $unwind: { path: "$placeDetails", preserveNullAndEmptyArrays: true } },

      // 4. CLEANUP & PROJECTION
      {
        $project: {
          // Flatten user data back to the structure expected by PickCard
          user: {
            _id: "$userDetails._id",
            fullName: "$userDetails.fullName",
            profilePicture: "$userDetails.profilePicture",
          },
          // Core Pick data
          description: 1,
          mediaUrls: 1,
          stars: 1,
          alias: 1,        // Include the alias field!
          place: 1,        // Include the raw place (ID/Link)
          upvoteCount: 1,
          commentCount: 1,
          createdAt: 1,
          // Hydrate place details if available
          placeDetails: {
            name: 1,
            location: 1
          }
        },
      },
    ]);
  },

  /**
   * READ (Discussion): Fetches comments for a specific pick.
   * Linked to socialController.postComment context.
   */
  async findByParent(parentId: string) {
    return await Pick.find({
      parentPick: parentId,
    })
      .sort({ createdAt: 1 }) // Discussion flows chronologically
      .populate("user", "fullName profilePicture")
      .lean();
  },

  /**
   * READ (Single): Fetches a specific pick by ID.
   */
  async findById(id: string) {
    // Validates string ID to avoid Mongoose casting errors
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Pick.findById(id).populate("user", "fullName profilePicture");
  },

  /**
   * READ (User): Fetches all picks by a specific author.
   */
  async findByUser(userId: string) {
    return await Pick.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "fullName profilePicture");
  },

  /**
   * UPDATE: Only updates if the user is the owner.
   */
  async update(pickId: string, userId: string, data: Partial<IPick>) {
    return await Pick.findOneAndUpdate(
      { _id: pickId, user: userId },
      { $set: data },
      { new: true, runValidators: true },
    );
  },

  /**
   * DELETE: Strictly owner-only removal.
   * Updated terminology from "purge" to "delete".
   */
  async delete(pickId: string, userId: string): Promise<boolean> {
    const result = await Pick.deleteOne({ _id: pickId, user: userId });
    return result.deletedCount > 0;
  },

  /**
   * UPVOTE LOGIC
   * Atomic update used by socialController.handleVote
   */
  async addUpvote(pickId: string, userId: string) {
    return await Pick.findByIdAndUpdate(
      pickId,
      {
        $addToSet: { upvotes: userId },
        $pull: { downvotes: userId },
      },
      { new: true },
    ).then((doc) => this._syncVoteCounts(doc));
  },

  /**
   * DOWNVOTE LOGIC
   * Atomic update used by socialController.handleVote
   */
  async addDownvote(pickId: string, userId: string) {
    return await Pick.findByIdAndUpdate(
      pickId,
      {
        $addToSet: { downvotes: userId },
        $pull: { upvotes: userId },
      },
      { new: true },
    ).then((doc) => this._syncVoteCounts(doc));
  },

  /**
   * REMOVE VOTE (Toggle Off)
   */
  async removeVote(pickId: string, userId: string) {
    return await Pick.findByIdAndUpdate(
      pickId,
      { $pull: { upvotes: userId, downvotes: userId } },
      { new: true },
    ).then((doc) => this._syncVoteCounts(doc));
  },

  /**
   * PRIVATE HELPER: Syncs the denormalized vote counts.
   */
  async _syncVoteCounts(doc: any) {
    if (!doc) return null;
    return await Pick.findByIdAndUpdate(
      doc._id,
      {
        $set: {
          upvoteCount: doc.upvotes.length,
          downvoteCount: doc.downvotes.length,
        },
      },
      { new: true },
    );
  },

  /**
   * READ: Fetches community reviews for a specific Google Link/Place Hub.
   */
  async findByPlace(placeLinkId: string) {
    return await Pick.find({ place: placeLinkId, parentPick: null })
      .populate("user", "fullName profilePicture")
      .sort({ createdAt: -1 });
  },

  /**
   * READ: Fetches picks by category for filtering.
   */
  async findByCategory(category: string, limit: number, skip: number) {
    return await Pick.find({ category, parentPick: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "fullName profilePicture")
      .lean();
  },

  async findAllPicks() {
    return await Pick.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName profilePicture")
      .lean();
  },
  /**
   * FETCH MEDIA VAULT: Retrieves only the transmissions that contain media.
   */
  async getMediaVault(userId: string, limit: number = 20, skip: number = 0) {
    return await Pick.find({
      user: userId,
      mediaUrls: { $exists: true, $not: { $size: 0 } },
    })
      .select("mediaUrls createdAt place alias") // Only get the essentials
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  // Add this logic to your Feed fetching repository
  async findRandomPicks(limit = 10, excludeIds: string[] = []) {
    return await Pick.aggregate([
      {
        $match: {
          parentPick: { $exists: false }, // Only top-level picks
          _id: { $nin: excludeIds.map((id) => new Types.ObjectId(id)) }, // Don't show what they've seen
        },
      },
      { $sample: { size: limit } }, // This provides the "different pick every time" feel
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);
  },
};
