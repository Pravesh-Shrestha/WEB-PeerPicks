import { placeRepository } from '../repositories/place.repository';

export const placeService = {
  /**
   * Retrieves places based on the user's GPS view.
   */
  async getLocalDiscovery(lng: number, lat: number, radius: number = 5000) {
    return await placeRepository.findNearby(lng, lat, radius);
  }
};