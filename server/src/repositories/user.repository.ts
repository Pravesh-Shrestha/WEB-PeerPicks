import { IUser, UserModel } from '../models/user.model';
import mongoose from 'mongoose';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  getUserById(userId: string): Promise<IUser | null>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(userId: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  follow(followerId: string, targetId: string): Promise<void>;
  unfollow(followerId: string, targetId: string): Promise<void>;
  isFollowing(followerId: string, targetId: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return await new UserModel(userData).save();
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return await UserModel.findById(userId).select("-password");
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(userId, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  /**
   * Permanently deletes a user from the database.
   */
  async deleteUser(userId: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(userId);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find().select("-password").sort({ createdAt: -1 });
  }

  /**
   * SOCIAL: Handles both follow and unfollow logic to reduce code duplication.
   * Uses atomic increments to keep counts in sync.
   */
  private async updateSocialConnection(
    followerId: string, 
    targetId: string, 
    isFollow: boolean
  ): Promise<void> {
    const operator = isFollow ? '$addToSet' : '$pull';
    const increment = isFollow ? 1 : -1;

    await Promise.all([
      // Update Follower: Modify 'following' list and count
      UserModel.findByIdAndUpdate(followerId, {
        [operator]: { following: targetId },
        $inc: { followingCount: increment }
      }),
      // Update Target: Modify 'followers' list and count
      UserModel.findByIdAndUpdate(targetId, {
        [operator]: { followers: followerId },
        $inc: { followerCount: increment }
      })
    ]);
  }

  async follow(followerId: string, targetId: string): Promise<void> {
    await this.updateSocialConnection(followerId, targetId, true);
  }

  async unfollow(followerId: string, targetId: string): Promise<void> {
    await this.updateSocialConnection(followerId, targetId, false);
  }

  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    const user = await UserModel.findOne({ _id: followerId, following: targetId });
    return !!user;
  }

  // Alias for findByEmail to match interface naming
  async getUserByEmail(email: string): Promise<IUser | null> {
    return this.findByEmail(email);
  }
}