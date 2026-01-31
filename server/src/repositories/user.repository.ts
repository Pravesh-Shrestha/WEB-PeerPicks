import { IUser, UserModel } from '../models/user.model';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  getUserById(userId: string): Promise<IUser | null>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(userId: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>; // Added for Admin functionality
}

export class UserRepository implements IUserRepository {
  /**
   * Finds a user by email for authentication purposes.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  /**
   * Persists a new user to the database.
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  /**
   * Retrieves a user by their MongoDB ObjectId.
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return await UserModel.findById(userId);
  }

  /**
   * Updates user data and returns the document *after* the update.
   */
  async updateUser(userId: string, updateData: any): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(userId, updateData, { 
        new: true,
        runValidators: true 
    });
  }

  /**
   * Permanently removes a user from the database.
   */
  async deleteUser(userId: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(userId);
  }

  /**
   * Retrieves all users for the Admin Management table.
   */
  async getAllUsers(): Promise<IUser[]> {
    // Exclude password for security
    return await UserModel.find().select("-password").sort({ createdAt: -1 });
  }
}