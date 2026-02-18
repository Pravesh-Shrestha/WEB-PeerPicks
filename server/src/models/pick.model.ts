import mongoose, { Schema, Document } from 'mongoose';

export interface IPick extends Document {
  user: mongoose.Types.ObjectId;      // The author
  place: string;                     // References Place.placeId
  parentPick?: mongoose.Types.ObjectId; // If they are reviewing a review
  stars: number;                     // Rating 1-5
  description: string;               // Review text
  mediaUrls: string[];               // Gallery (Pinterest style)
  tags: string[];                    // e.g., ["Cozy", "Good for work"]
  upvoteCount: number;
  commentCount: number;
  createdAt: Date;
}

const PickSchema = new Schema<IPick>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  place: { type: String, required: true }, 
  parentPick: { type: Schema.Types.ObjectId, ref: 'Pick', default: null },
  stars: { type: Number, required: true, min: 1, max: 5 },
  description: { type: String, required: true },
  mediaUrls: [{ type: String }],
  tags: [{ type: String }],
  upvoteCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IPick>('Pick', PickSchema);