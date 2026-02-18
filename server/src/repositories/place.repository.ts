import Place, { IPlace } from '../models/place.model';

export const placeRepository = {
  /**
   * UPSERT: Finds a place by its Google Link or creates it.
   * This ensures one place can be reviewed by many users without duplication.
   */
  async upsertPlace(placeData: Partial<IPlace>): Promise<IPlace> {
    return (await Place.findOneAndUpdate(
      { placeId: placeData.placeId }, // The Google Maps URL
      { $set: placeData },
      { upsert: true, new: true, runValidators: true }
    )) as IPlace;
  },

  async findByLinkId(linkId: string): Promise<IPlace | null> {
    return await Place.findOne({ placeId: linkId });
  }
};