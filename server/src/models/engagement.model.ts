import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  pick: mongoose.Types.ObjectId;
  type: 'up' | 'down'; // Explicitly define the type
}

const VoteSchema = new Schema<IVote>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pick: { type: Schema.Types.ObjectId, ref: 'Pick', required: true },
  type: { type: String, enum: ['up', 'down'], required: true }
}, { timestamps: true });

// Crucial: This index ensures a user only has ONE vote entry per pick.
// If they change from 'up' to 'down', we update this record instead of creating a new one.
VoteSchema.index({ user: 1, pick: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);