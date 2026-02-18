import mongoose, { Schema, Document } from 'mongoose';

export interface IUpvote extends Document {
  user: mongoose.Types.ObjectId;
  pick: mongoose.Types.ObjectId;
}

const UpvoteSchema = new Schema<IUpvote>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pick: { type: Schema.Types.ObjectId, ref: 'Pick', required: true }
}, { timestamps: true });

// Ensures a user can only upvote a specific pick once
UpvoteSchema.index({ user: 1, pick: 1 }, { unique: true });

export default mongoose.model<IUpvote>('Upvote', UpvoteSchema);