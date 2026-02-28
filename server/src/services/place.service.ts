import { placeRepository } from '../repositories/place.repository';
import { pickRepository } from '../repositories/pick.repository';

export const placeService = {
  /**
   * GET HUB PROFILE: Returns the Place info + every user who reviewed it.
   */
  async getPlaceHubDetails(linkId: string) {
    const place = await placeRepository.findByLinkId(linkId);
    if (!place) throw new Error("Location hub not found.");

    // Fetch all 'Picks' associated with this unique link
    const communityPicks = await pickRepository.findByPlace(linkId);

    return {
      place,
      communityPicks
    };
  }
};