import Place, { IPlace } from '../models/place.model';

export const placeRepository = {
  // Find a place by its external ID (e.g., Google Maps ID)
  async findByPlaceId(placeId: string): Promise<IPlace | null> {
    return await Place.findOne({ placeId });
  },

  // Create or Update place metadata
  async upsertPlace(placeData: Partial<IPlace>): Promise<IPlace | null> {
    return await Place.findOneAndUpdate(
      { placeId: placeData.placeId },
      { $set: placeData },
      { upsert: true, new: true }
    );
  },

  // Geo-spatial search for the "Real-time Map" feature
  async findNearby(lng: number, lat: number, radiusInMeters: number = 5000) {
    return await Place.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusInMeters
        }
      }
    });
  }
};