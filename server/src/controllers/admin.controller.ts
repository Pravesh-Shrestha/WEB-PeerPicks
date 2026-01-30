import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { updateUserDTO } from "../dtos/auth.dto"; // Reusing your DTOs
import { HttpError } from "../errors/http-error";

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
      const message = (error instanceof Error) ? error.message : "An unexpected error occurred";
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Create a new user (Admin version - can bypass some signup restrictions)
   */
  async createUser(req: Request, res: Response) {
    try {
      // Use req.body directly or create a specific adminCreateUserDTO
      const userData = req.body;
      
      if (req.file) {
        userData.profilePicture = `/uploads/${req.file.filename}`;
      }

      const user = await userRepository.create(userData);
      res.status(201).json({ success: true, message: "User created by Admin", user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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
        return res.status(400).json({ success: false, errors: parsedData.error.errors });
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
            .status(401)
            .json({ success: false, message: "Unauthorized" });
        }
        const user = await userRepository.getUserById(userId);
        return res
          .status(200)
          .json({
            success: true,
            data: user,
            message: "User profile fetched successfully",
          });
      } catch (error: Error | any) {
        return res
          .status(error.statusCode || 500)
          .json({
            success: false,
            message: error.message || "Internal Server Error",
          });
      }
    }
}