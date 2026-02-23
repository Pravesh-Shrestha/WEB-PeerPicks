import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const authController = new AuthController();

// ... imports remain the same

// 1. PUBLIC NODES
router.post("/register", authController.signup);
router.post("/login", authController.login);
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);

// 2. PROTECTED IDENTITY (The "Me" Signal)
// This ensures the frontend can refresh the session
router.get("/me", authorizedMiddleware, authController.getUserProfile);

// 3. PROTECTED ACTIONS
router.put(
    "/update-profile", 
    authorizedMiddleware, 
    uploads.single('profilePicture'), 
    authController.updateUserProfile
);

// 4. DISCOVERY NODES (Public Profiles)
// Terminology change: Move this to a dedicated user service if it grows
router.get("/profile/:id", authController.getUserProfile);

export default router;