// pick.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPick extends Document {
  user: mongoose.Types.ObjectId;
  place: mongoose.Types.ObjectId;
  alias: string;
  parentPick?: mongoose.Types.ObjectId;
  category?: string;
  stars: number;
  description: string;
  mediaUrls: string[];
  mediaMetadata?: {
  url: string;
  blurHash: string;
  width: number;
  height: number;
}[];
  tags: string[];
  // NEW FIELDS FOR ENGAGEMENT
  upvotes: mongoose.Types.ObjectId[];   // Track WHO upvoted
  downvotes: mongoose.Types.ObjectId[]; // Track WHO downvoted
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  createdAt: Date;
  location: {
  type: "Point";
  coordinates: [number, number]; // [Longitude, Latitude]
  };
}

const PickSchema = new Schema<IPick>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  place: { type: Schema.Types.ObjectId, ref: 'Place', required: true }, 
  alias: { type: String, required: true },
  parentPick: { type: Schema.Types.ObjectId, ref: 'Pick', default: null },
  category: { type: String, default: null },
  stars: { type: Number, required: true, min: 1, max: 5 },
  description: { type: String, required: true },
  mediaUrls: [{ type: String }], 
  mediaMetadata: [{
  url: String,
  blurHash: String,
  width: Number,
  height: Number
}],
  tags: [{ type: String }],
  // Track specific users to prevent double-voting and handle "toggling"
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  upvoteCount: { type: Number, default: 0 },
  downvoteCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true } // [lng, lat]
},
}, { timestamps: true });

// Optional: Indexing for performance
PickSchema.index({ upvotes: 1 });
PickSchema.index({ downvotes: 1 });
PickSchema.index({ location: "2dsphere" });

export default mongoose.models.Pick || mongoose.model<IPick>('Pick', PickSchema);