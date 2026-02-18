import mongoose, { Schema, Document } from 'mongoose';

export interface IPick extends Document {
  user: mongoose.Types.ObjectId;       // Author of the post
  place: string;                      // Stores the Google Maps URL (Place.placeId)
  alias: string;                      // The "Alias" for the place (e.g., "Epsu Ko Ghar")
  parentPick?: mongoose.Types.ObjectId; // For "Consensus" (comments/threads)
  category?: string;                   // Optional category for easier filtering
  stars: number;                      // 1-5 Star Rating
  description: string;                // The caption/review text
  mediaUrls: string[];                // Array of up to 5 photos/videos
  tags: string[];                     // e.g., ["Cafe", "Kathmandu"]
  upvoteCount: number;                // Support count
  commentCount: number;               // Consensus count
  createdAt: Date;
}

const PickSchema = new Schema<IPick>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // place links to the placeId in PlaceModel (which is now the Google Link)
  place: { type: String, required: true }, 
  alias: { type: String, required: true },
  parentPick: { type: Schema.Types.ObjectId, ref: 'Pick', default: null },
  category: { type: String, default: null },
  stars: { type: Number, required: true, min: 1, max: 5 },
  description: { type: String, required: true },
  mediaUrls: [{ type: String }], 
  tags: [{ type: String }],
  upvoteCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IPick>('Pick', PickSchema);