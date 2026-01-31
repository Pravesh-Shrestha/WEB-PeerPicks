import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { signupDTO, updateUserDTO } from "../dtos/auth.dto"; // Reusing your DTOs
import { HttpError } from "../errors/http-error";
import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";
// Instantiate the repository
const userRepository = new UserRepository();

export class AdminController {
  /**
   * Fetch all users for the admin dashboard
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.getAllUsers();
      // Ensure the key is exactly "users"
      return res.status(200).json({ success: true, users });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Create a new user (Admin version - can bypass some signup restrictions)
   */
  async createUser(req: Request, res: Response) {
    try {
      const parsed = signupDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.errors });
      }

      // 1. Hash the password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(parsed.data.password, salt);

      // 2. Map data and fix the TypeScript 'null' vs 'undefined' error
      const userData = {
        ...parsed.data,
        password: hashedPassword, // Use the hash, not plain text
        profilePicture: parsed.data.profilePicture ?? undefined, // Fixes TS2345
      };

      // 3. Handle file
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
      const { id } = req.params; // The ID of the user being edited, not the Admin

      const parsedData = updateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, errors: parsedData.error.errors });
      }

      if (req.file) {
        parsedData.data.profilePicture = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await userRepository.updateUser(id, parsedData.data);

      return res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Peer identity synchronized successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete user from system
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedUser = await userRepository.deleteUser(id);

      if (!deletedUser) throw new HttpError(404, "User not found");

      return res.status(200).json({
        success: true,
        message: `User ${id} successfully purged from system`,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID required" });
      }
      const user = await userRepository.getUserById(userId);
      return res.status(200).json({
        success: true,
        user: user, // Changed from 'data' to 'user'
        message: "User profile fetched successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      // 1. Fetch Totals
      const totalUsers = await UserModel.countDocuments();
      const activeAdmins = await UserModel.countDocuments({ role: "admin" });

      // 2. Calculate New Today (since start of current day)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const newToday = await UserModel.countDocuments({
        createdAt: { $gte: startOfToday },
      });

      // 3. Get Recent Activity (last 5 updated users)
      const recentActivity = await UserModel.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("fullName updatedAt role");

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
}