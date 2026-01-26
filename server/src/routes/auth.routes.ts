import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.signup);
router.post("/login", authController.login);

router.get("/whoami", authorizedMiddleware, authController.getUserProfile);


router.put("/update-profile", authorizedMiddleware, uploads.single('profilePicture'), authController.updateUserProfile);





export default router;