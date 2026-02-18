import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
  placeId: string;    // External ID (e.g., from Google Places API)
  name: string;
  category: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [Longitude, Latitude]
  };
}

const PlaceSchema = new Schema<IPlace>({
  placeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  }
});

// This index allows us to search for places "near" the user's GPS
PlaceSchema.index({ location: '2dsphere' });

export default mongoose.model<IPlace>('Place', PlaceSchema);