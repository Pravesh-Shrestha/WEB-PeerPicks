// src/routes/admin.routes.ts
import { Router } from "express";
import { AdminController } from "../../controllers/admin/admin.controller";
import { protect, isAdmin } from "../../middlewares/admin.middleware";
import multer from "multer";

const router = Router();
const adminController = new AdminController();

// Configure multer for profile pictures or media moderation if needed
const upload = multer({ dest: 'uploads/' });

/**
 * --- DASHBOARD & ANALYTICS ---
 */
router.get('/dashboard-stats', protect, isAdmin, (req, res) => adminController.getDashboardStats(req, res));

/**
 * --- USER MANAGEMENT ---
 */
router.get("/users", protect, isAdmin, (req, res) => adminController.getAllUsers(req, res));
router.get('/users/:id', protect, isAdmin, (req, res) => adminController.getUserById(req, res));
router.post("/users", protect, isAdmin, upload.single('profilePicture'), (req, res) => adminController.createUser(req, res));
router.put("/users/:id", protect, isAdmin, upload.single('profilePicture'), (req, res) => adminController.updateUser(req, res));
router.delete("/users/:id", protect, isAdmin, (req, res) => adminController.deleteUser(req, res));

/**
 * --- PICK (POST) MANAGEMENT ---
 */
// Fetch all signals with filters (category, stars, etc.)
router.get("/picks", protect, isAdmin, (req, res) => adminController.getAllPicks(req, res));

// Get trending content based on upvoteCount from your Pick model
router.get("/picks/trending", protect, isAdmin, (req, res) => adminController.getTrendingPicks(req, res));

// Permanent delete of content
router.delete("/picks/:id", protect, isAdmin, (req, res) => adminController.deletePick(req, res));
// Bulk actions
router.post("/picks/bulk-delete", protect, isAdmin, (req, res) => adminController.bulkDeletePicks(req, res));

// Engagement moderation
router.patch("/picks/:id/reset-engagement", protect, isAdmin, (req, res) => adminController.resetPickEngagement(req, res));

/**
 * --- SYSTEM & GEO TOOLS ---
 */
// Detect picks without valid users or places (data integrity)
router.get("/system/audit", protect, isAdmin, (req, res) => adminController.getOrphanedPicks(req, res));

// View density based on coordinates
router.get("/system/geo-density", protect, isAdmin, (req, res) => adminController.getPickDensity(req, res));

export default router;