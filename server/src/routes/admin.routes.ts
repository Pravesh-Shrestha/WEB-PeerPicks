// src/routes/admin.routes.ts
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { protect, isAdmin } from "../middlewares/admin.middleware";
import multer from "multer";

const router = Router();
const adminController = new AdminController();
const upload = multer({ dest: 'uploads/' });


router.get("/users", protect, isAdmin, (req, res) => adminController.getAllUsers(req, res));
router.post("/users", protect, isAdmin, upload.single('profilePicture'), (req, res) => adminController.createUser(req, res));
router.put("/users/:id", protect, isAdmin, upload.single('profilePicture'), (req, res) => adminController.updateUser(req, res));
router.delete("/users/:id", protect, isAdmin, (req, res) => adminController.deleteUser(req, res));

export default router;