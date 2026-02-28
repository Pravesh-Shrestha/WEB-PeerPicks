import mongoose, { Schema } from 'mongoose';

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
  dob: Date; 
  phone: string;
  role: 'user' | 'admin';
  profilePicture?: string; 
  // --- SOCIAL FIELDS ---
  followers: mongoose.Types.ObjectId[];    // Users following this user
  following: mongoose.Types.ObjectId[];    // Users this user follows
  followerCount: number;
  followingCount: number;
  savedPicks: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  profilePicture: { type: String, required: false }, 
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  // --- SOCIAL SCHEMA ---
  followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  savedPicks: [{ type: Schema.Types.ObjectId, ref: 'Pick', default: [] }],
}, { timestamps: true });

// Indexing for faster social lookups in the Discovery Feed
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);