import { IUser, UserModel } from '../models/user.model';
import mongoose from 'mongoose';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  getUserById(userId: string): Promise<IUser | null>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(userId: string): Promise<IUser | null>; // Protocol: [2026-02-01]
  getAllUsers(): Promise<IUser[]>;
  follow(followerId: string, targetId: string): Promise<void>;
  unfollow(followerId: string, targetId: string): Promise<void>;
  isFollowing(followerId: string, targetId: string): Promise<boolean>;
  getFollowingIds(userId: string): Promise<string[]>;
}

export class UserRepository implements IUserRepository {
  /**
   * FIX: The Identity Handshake often fails due to casing.
   * We normalize the email signal here to ensure 401s don't happen due to typos.
   */
  async findByEmail(email: string): Promise<IUser | null> {
  if (!email) return null;
  // Use a case-insensitive regex or simply lowercase the input
  return await UserModel.findOne({ 
    email: email.toLowerCase().trim() 
  }).exec();
}

  async create(userData: Partial<IUser>): Promise<IUser> {
    // Ensure email is stored normalized
    if (userData.email) userData.email = userData.email.toLowerCase().trim();
    return await new UserModel(userData).save();
  }

  async getUserById(userId: string): Promise<IUser | null> {
    // Lean queries are faster for read-only operations
    return await UserModel.findById(userId).select("-password");
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (updateData.email) updateData.email = updateData.email.toLowerCase().trim();
    
    return await UserModel.findByIdAndUpdate(userId, updateData, { 
      new: true, 
      runValidators: true 
    }).exec();
  }

  /**
   * [2026-02-01] Delete Protocol: Permanent removal of identity.
   */
  async deleteUser(userId: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(userId).exec();
  }

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find()
      .select("-password")
      .sort({ createdAt: -1 })
  }

  /**
   * SOCIAL: Uses MongoDB Transactions to ensure both sides of the 
   * handshake are committed or rolled back together.
   */
  private async updateSocialConnection(
    followerId: string, 
    targetId: string, 
    isFollow: boolean
  ): Promise<void> {
    const operator = isFollow ? '$addToSet' : '$pull';
    const increment = isFollow ? 1 : -1;

    const followerUpdate = {
      [operator]: { following: targetId },
      $inc: { followingCount: increment },
    };

    const targetUpdate = {
      [operator]: { followers: followerId },
      $inc: { followerCount: increment },
    };

    const applyWithoutTransaction = async () => {
      await Promise.all([
        UserModel.findByIdAndUpdate(followerId, followerUpdate),
        UserModel.findByIdAndUpdate(targetId, targetUpdate),
      ]);
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Promise.all([
        UserModel.findByIdAndUpdate(followerId, followerUpdate, { session }),
        UserModel.findByIdAndUpdate(targetId, targetUpdate, { session }),
      ]);

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();

      const message = `${error?.message || ""}`;
      const code = error?.code;
      const isStandaloneTransactionError =
        message.includes("Transaction numbers are only allowed on a replica set member") ||
        message.includes("Transaction not supported") ||
        code === 20;

      if (isStandaloneTransactionError) {
        await applyWithoutTransaction();
        return;
      }

      throw error;
    } finally {
      session.endSession();
    }
  }

  async follow(followerId: string, targetId: string): Promise<void> {
    await this.updateSocialConnection(followerId, targetId, true);
  }

  async unfollow(followerId: string, targetId: string): Promise<void> {
    await this.updateSocialConnection(followerId, targetId, false);
  }

  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    // Use .countDocuments for a "leaner" check than fetching the whole document
    const count = await UserModel.countDocuments({ 
      _id: followerId, 
      following: targetId 
    });
    return count > 0;
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const user = await UserModel.findById(userId).select('following').lean();
    if (!user?.following?.length) return [];
    return user.following.map((id: any) => id.toString());
  }
}