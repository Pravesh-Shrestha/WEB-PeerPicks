import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
  placeId: string;    // This will now store the Google Maps Link
  name: string;       // This will store the "Alias" (e.g., "Epsu Ko Ghar")
  category: string;
  address: string;    // The raw Link again (for easy retrieval)
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

const PlaceSchema = new Schema<IPlace>({
  placeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } 
  }
});

export default mongoose.model<IPlace>('Place', PlaceSchema);