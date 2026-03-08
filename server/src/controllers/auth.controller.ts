import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { signupDTO, loginDTO, updateUserDTO } from "../dtos/auth.dto";
import { HttpError } from "../errors/http-error";
import { pickService } from "../services/pick.service";
import { notificationRepository } from "../repositories/notification.repository";

const authService = new AuthService();

export class AuthController {
  /**
   * SIGNUP PROTOCOL: Creates user and initializes isolated welcome signal.
   */
  async signup(req: Request, res: Response) {
    try {
      const validatedData = signupDTO.parse(req.body);
      const user = await authService.register(validatedData);

      /**
       * INITIALIZE NODE: Welcome Signal [2026-02-01]
       * Triggers a dedicated notification for the new user ID.
       */
      try {
        if (user && user._id) {
          // Pass the string version of ObjectId for repository compatibility
          await notificationRepository.createWelcomeNotification(
            user._id.toString()
          );
        }
      } catch (notifyError) {
        console.error("WELCOME_SIGNAL_FAILED:", notifyError);
      }

      res.status(201).json({
        success: true,
        message: "Registration successful. Welcome to PeerPicks!",
        user,
      });
    } catch (error: any) {
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
        ...result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message:
          error.message || "Login failed. Please check your credentials.",
      });
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      // If hitting /me, there is no :id param. Use the ID from the token middleware.
      const id = req.params.id || (req as any).user?.id;

      if (!id) throw new HttpError(401, "No Node ID provided");

      const nodeActivity = await pickService.getPicksByUser(
        id,
        (req as any).user?.id,
      );

      return res.status(200).json({
        success: true,
        data: nodeActivity, // This now contains profile + picks
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to sync with Node.",
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
          message: parsedData.error.errors[0].message,
        });
      }

      // If middleware processed a profile picture, persist the remote URL
      if (req.file) {
        const uploadedUrl = (req.file as any).path || (req.file as any).secure_url;
        if (uploadedUrl) {
          parsedData.data.profilePicture = uploadedUrl;
        }
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
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    } catch (error: any) {
      console.error("Reset Email Error:", error);
      // We return 200 even on error to prevent email enumeration attacks
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a reset link has been sent.",
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
        message: "Password has been reset successfully.",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
