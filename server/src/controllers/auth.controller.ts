import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { signupDTO, loginDTO, updateUserDTO } from "../dtos/auth.dto";
import { HttpError } from "../errors/http-error";

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const validatedData = signupDTO.parse(req.body);
      const user = await authService.register(validatedData);
      
      res.status(201).json({ 
        success: true, 
        message: "Registration successful", 
        user 
      });
    } catch (error: any) {
      // Zod errors contain an 'issues' or 'errors' array
      const message = error.errors ? error.errors[0].message : error.message;
      res.status(400).json({
        success: false,
        message: message || "Validation failed",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginDTO.parse(req.body);
      const result = await authService.login(validatedData);
      
      // result usually contains { user, token }
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(401).json({ 
        success: false, 
        message: error.message || "Login failed. Please check your credentials." 
      });
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      // Unified userId extraction to match authorizedMiddleware
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        throw new HttpError(401, "Unauthorized: No user session found");
      }

      const user = await authService.getUserById(userId);
      return res.status(200).json({
        success: true,
        data: user,
        message: "User profile fetched successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUserProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id || req.user?.id; 
      
      if (!userId) {
        throw new HttpError(401, "Unauthorized");
      }

      const parsedData = updateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
            success: false, 
            message: parsedData.error.errors[0].message 
        });
      }

      // If middleware processed a profile picture
      if (req.file) {
        parsedData.data.profilePicture = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await authService.updateUser(userId, parsedData.data);

      return res.status(200).json({
        success: true,
        user: updatedUser,
        message: "User profile updated successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async sendResetPasswordEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) throw new HttpError(400, "Email is required");

      await authService.sendResetPasswordEmail(email);
      
      return res.status(200).json({ 
        success: true,
        message: "If an account exists with this email, a reset link has been sent." 
      });
    } catch (error: any) {
      console.error("Reset Email Error:", error);
      // We return 200 even on error to prevent email enumeration attacks
      return res.status(200).json({ 
        success: true, 
        message: "If an account exists with this email, a reset link has been sent." 
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.params.token;
      const { newPassword } = req.body;
      
      if (!newPassword) throw new HttpError(400, "New password is required");

      await authService.resetPassword(token, newPassword);
      return res.status(200).json({ 
        success: true, 
        message: "Password has been reset successfully." 
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || "Internal Server Error" 
      });
    }
  }
}