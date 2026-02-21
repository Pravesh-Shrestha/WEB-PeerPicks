import Pick from '../models/pick.model';

export const mapRepository = {
  /**
   * FIND NEARBY: Scans the grid for transmissions within a specific radius.
   * @param lng Longitude
   * @param lat Latitude
   * @param radiusInMeters Default is 5000 (5km)
   */
  async findNearbyTransmissions(lng: number, lat: number, radiusInMeters: number = 5000) {
    return await Pick.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusInMeters
        }
      },
      parentPick: null // Only main transmissions, not comments
    })
    .populate("user", "fullName profilePicture")
    .limit(50)
    .lean();
  }
};