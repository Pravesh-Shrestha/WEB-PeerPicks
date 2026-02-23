import Favorite from "../models/favorites.model"; // Assuming you have a Favorite Mongoose model
import { Types } from "mongoose";

export const favoriteRepository = {
  /**
   * TOGGLE SAVE: Adds to vault if missing, removes if present.
   */
  toggleSave: async (userId: string, pickId: string) => {
    const userOID = new Types.ObjectId(userId);
    const pickOID = new Types.ObjectId(pickId);

    const existing = await Favorite.findOneAndDelete({
      user: userOID,
      pick: pickOID,
    });

    if (existing) {
      return { isSaved: false, message: "Removed from vault." };
    }

    await Favorite.create({
      user: userOID,
      pick: pickOID,
    });

    return { isSaved: true, message: "Saved to vault." };
  },

  /**
   * FIND USER FAVORITES: Returns the full pick data for everything a user has saved.
   */
  findUserFavorites: async (userId: string) => {
    try {
      const favorites = await Favorite.find({
        user: new Types.ObjectId(userId),
      })
        .populate({
          path: "pick",
          // Make sure 'user' matches the field name in your Pick Schema
          populate: { path: "user", select: "fullName name profilePicture" },
        })
        .sort({ createdAt: -1 });

      // Filter out nulls in case a pick was DELETED but the favorite record remains
      return favorites.filter((f) => f.pick !== null).map((f) => f.pick);
    } catch (error) {
      console.error("DB Favorite Query Error:", error);
      throw error; // This triggers the 500 we see in the logs
    }
  },
};
