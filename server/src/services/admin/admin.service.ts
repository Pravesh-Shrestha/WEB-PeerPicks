import Pick from "../../models/pick.model";
import { UserModel as User } from "../../models/user.model";
import mongoose from "mongoose";

export const AdminService = {
  // --- DASHBOARD & ANALYTICS ---
  async getGlobalStats() {
    const [totalPicks, totalUsers, engagementData] = await Promise.all([
      Pick.countDocuments(),
      User.countDocuments(),
      Pick.aggregate([
        {
          $group: {
            _id: null,
            avgStars: { $avg: "$stars" },
            totalUpvotes: { $sum: "$upvoteCount" },
            totalComments: { $sum: "$commentCount" }
          }
        }
      ])
    ]);

    const recentPicks = await Pick.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "fullName email profilePicture");
    
    return { 
      totalPicks, 
      totalUsers, 
      recentPicks,
      analytics: engagementData[0] || { avgStars: 0, totalUpvotes: 0, totalComments: 0 }
    };
  },

  // --- POST (PICK) MANAGEMENT ---
  async getAllPicks(page = 1, limit = 10, filter: any = {}) {
    const skip = (page - 1) * limit;
    
    const picks = await Pick.find(filter)
      .populate("user", "fullName email profilePicture")
      .populate("place", "name alias")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pick.countDocuments(filter);
    
    return { 
      picks, 
      total, 
      pages: Math.ceil(total / limit),
      currentPage: page 
    };
  },

  async deletePick(pickId: string) {
    // Permanent deletion logic as requested
    const deleted = await Pick.findByIdAndDelete(pickId);
    if (!deleted) throw new Error("Pick not found or already deleted");
    return deleted;
  },

  async bulkDeletePicks(pickIds: string[]) {
    return await Pick.deleteMany({ _id: { $in: pickIds } });
  },

  // --- GEOSPATIAL FEATURES ---
  async getRegionalDensity(longitude: number, latitude: number, radiusInMeters: number = 5000) {
    return await Pick.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: radiusInMeters
        }
      }
    }).limit(100);
  },

  // --- USER MANAGEMENT ---
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await User.countDocuments();
    return { users, total };
  },

  async toggleUserBan(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    
    // Assuming 'isBanned' exists or is handled via role/status
    // If your schema doesn't have isBanned, we can use a status field
    (user as any).isBanned = !(user as any).isBanned;
    return await user.save();
  },

  async changeUserRole(userId: string, newRole: 'user' | 'admin') {
    return await User.findByIdAndUpdate(
      userId, 
      { role: newRole }, 
      { new: true }
    ).select("-password");
  }
};