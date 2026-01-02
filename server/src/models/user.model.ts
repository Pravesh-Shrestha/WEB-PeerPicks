import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
}, { timestamps: true });

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  role: 'user' | 'admin';
}

export const UserModel = mongoose.model<IUser>('User', userSchema);