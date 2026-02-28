import Pick from '../models/pick.model';

export const mapRepository = {
  /**
   * FIND NEARBY: Scans the grid for transmissions within a specific radius.
   * @param lng Longitude
   * @param lat Latitude
   * @param radiusInMeters Default is 5000 (5km)
   */
  async findNearbyTransmissions(lng: number, lat: number, radiusInMeters: number = 5000) {
    const query = {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusInMeters,
        },
      },
      parentPick: null,
    };

    try {
      return await Pick.find(query)
        .populate("user", "fullName profilePicture")
        .limit(50)
        .lean();
    } catch (error: any) {
      const message = `${error?.message || ""}`;
      const missingGeoIndex =
        message.includes("unable to find index for $geoNear query") ||
        message.includes("unable to find index for $near query") ||
        message.includes("geo index") ||
        error?.code === 27;

      if (!missingGeoIndex) {
        throw error;
      }

      await Pick.collection.createIndex({ location: "2dsphere" });

      return await Pick.find(query)
        .populate("user", "fullName profilePicture")
        .limit(50)
        .lean();
    }
  }
};