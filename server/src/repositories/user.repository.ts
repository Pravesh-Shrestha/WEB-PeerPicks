import { IUser, UserModel } from '../models/user.model';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  getUserById(userId: string): Promise<IUser | null>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(userId: string): Promise<IUser | null>;
}
export class UserRepository implements IUserRepository {
  async findByEmail(email: string) {
    return await UserModel.findOne({ email });
  }

  async create(userData: Partial<IUser>) {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserById(userId: string) {
    return await UserModel.findById(userId);
  }
  
  async updateUser(userId: string, updateData: any) {
    return await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async deleteUser(userId: string) {
    return await UserModel.findByIdAndDelete(userId);
  }
  
}