import { Request, Response } from "express";
import { UserRepository } from "../../repositories/user.repository";
import { signupDTO, updateUserDTO } from "../../dtos/auth.dto";
import { HttpError } from "../../errors/http-error";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";
import Pick from "../../models/pick.model";

// Instantiate the repository
const userRepository = new UserRepository();

export class AdminController {
  /**
   * Fetch all users for the admin dashboard
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.getAllUsers();
      // Ensure the key is exactly "users" as requested
      return res.status(200).json({ success: true, users });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Create a new user (Admin version - bypasses standard restrictions)
   */
  async createUser(req: Request, res: Response) {
    try {
      const parsed = signupDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.errors });
      }

      // 1. Hash the password manually for the new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(parsed.data.password, salt);

      // 2. Map data and handle profile picture logic
      const userData = {
        ...parsed.data,
        password: hashedPassword,
        profilePicture: parsed.data.profilePicture ?? undefined,
      };

      // 3. Handle file upload if present
      if (req.file) {
        userData.profilePicture = `/uploads/${req.file.filename}`;
      }

      const user = await userRepository.create(userData as any);
      
      return res.status(201).json({ 
        success: true, 
        message: "User created and password hashed", 
        user 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin can update ANY user profile by ID
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedData = updateUserDTO.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ success: false, errors: parsedData.error.errors });
      }

      const updatePayload: any = { ...parsedData.data };

      // Hash the password if a new one is provided; otherwise, remove it to prevent blanking out the DB
      if (updatePayload.password && updatePayload.password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
      } else {
        delete updatePayload.password;
      }

      if (req.file) {
        updatePayload.profilePicture = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await userRepository.updateUser(id, updatePayload);
      return res.status(200).json({ 
        success: true, 
        user: updatedUser, 
        message: "Peer identity synchronized" 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Permanent deletion of user from the system
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { adminPassword } = req.body as { adminPassword?: string };

      if (!req.user?._id) {
        throw new HttpError(401, "Authentication required");
      }

      if (!adminPassword || adminPassword.trim().length === 0) {
        throw new HttpError(400, "Admin password is required to delete an account");
      }

      const admin = await UserModel.findById(req.user._id).select("password");
      if (!admin) {
        throw new HttpError(401, "Admin account not found");
      }

      const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
      if (!isPasswordValid) {
        throw new HttpError(401, "Invalid admin password");
      }

      const deletedUser = await userRepository.deleteUser(id);

      if (!deletedUser) throw new HttpError(404, "User not found");

      return res.status(200).json({
        success: true,
        message: `User ${id} successfully deleted from system`,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Fetch specific user profile
   */
  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }
      const user = await userRepository.getUserById(userId);
      return res.status(200).json({
        success: true,
        user: user,
        message: "User profile fetched successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * Aggregated data for the Admin Dashboard overview
   */
  async getDashboardStats(req: Request, res: Response) {
    try {
      // 1. Fetch Totals using the Model directly
      const totalUsers = await UserModel.countDocuments();
      const activeAdmins = await UserModel.countDocuments({ role: "admin" });

      // 2. Calculate New Today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const newToday = await UserModel.countDocuments({
        createdAt: { $gte: startOfToday },
      });

      // 3. Get Recent Activity (limited to last 5)
      const recentActivity = await UserModel.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("fullName updatedAt role profilePicture");

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          newToday,
          activeAdmins,
        },
        recentActivity,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  /**
   * Fetch all Picks with advanced filtering for the Admin Table
   */
  async getAllPicks(req: Request, res: Response) {
    try {
      const { category, minStars, search } = req.query;
      let query: any = {};

      if (category) query.category = category;
      if (minStars) query.stars = { $gte: Number(minStars) };
      if (search) query.description = { $regex: search, $options: "i" };

      const picks = await Pick.find(query)
        .populate("user", "fullName email")
        .populate("place", "name")
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, picks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin-level Delete for any Pick
   */
  async deletePick(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedPick = await Pick.findByIdAndDelete(id);

      if (!deletedPick) throw new HttpError(404, "Signal not found in system");

      return res.status(200).json({
        success: true,
        message: `Pick ${id} successfully deleted`,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  /**
   * Content Audit: Identify "Ghost" Picks (Picks without valid users or places)
   */
  async getOrphanedPicks(req: Request, res: Response) {
    try {
      // Find picks where the referenced user or place no longer exists
      const picks = await Pick.find().populate("user place");
      const orphaned = picks.filter(p => !p.user || !p.place);

      return res.status(200).json({ 
        success: true, 
        count: orphaned.length, 
        orphanedPicks: orphaned 
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Trend Analysis: Get top performing picks by upvoteCount
   */
  async getTrendingPicks(req: Request, res: Response) {
    try {
      const trending = await Pick.find()
        .sort({ upvoteCount: -1, commentCount: -1 })
        .limit(10)
        .populate("user", "fullName profilePicture");

      return res.status(200).json({ success: true, trending });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Geo-Spatial Overview: Count signals by geographic radius
   */
  async getPickDensity(req: Request, res: Response) {
    try {
      const { lng, lat, radiusInKm } = req.query;
      if (!lng || !lat) throw new HttpError(400, "Coordinates required");

      const areaPicks = await Pick.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(radiusInKm) * 1000 // Convert km to meters
          }
        }
      });

      return res.status(200).json({ success: true, count: areaPicks.length, areaPicks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  /**
   * Bulk Delete: Permanently remove a selection of Picks
   * Terminates files and references via Mongoose hooks
   */
  async bulkDeletePicks(req: Request, res: Response) {
    try {
      const { ids } = req.body; // Expecting ["id1", "id2", ...]

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: "No signal IDs provided" });
      }

      // We use find and loop for small batches to ensure 'pre' hooks trigger,
      // OR use deleteMany for raw speed if hooks aren't needed.
      const result = await Pick.deleteMany({ _id: { $in: ids } });

      return res.status(200).json({
        success: true,
        message: `${result.deletedCount} items deleted. System synchronized.`,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

/**
 * Reset Engagement: Reset counts for specific picks (e.g., if manipulated by bots)
 */
async resetPickEngagement(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updatedPick = await Pick.findByIdAndUpdate(
      id,
      {
        upvotes: [],
        downvotes: [],
        upvoteCount: 0,
        downvoteCount: 0,
        commentCount: 0
      },
      { new: true }
    );

    if (!updatedPick) throw new HttpError(404, "Pick not found");

    return res.status(200).json({
      success: true,
      message: "Engagement metrics have been reset",
      pick: updatedPick
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
}