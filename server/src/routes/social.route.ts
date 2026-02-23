// routes/social.route.ts
import { Router } from "express";
import { socialController } from "../controllers/social.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();

/**
 * 1. CONNECTIONS
 * Handles follower/following logic.
 */
router.post("/follow/:targetUserId", authorizedMiddleware, socialController.toggleFollow);
router.post("/unfollow/:targetUserId", authorizedMiddleware, socialController.toggleFollow); 

/**
 * 2. CONSENSUS (VOTING)
 * Maps to /api/social/vote/:id
 */
router.post("/vote/:pickId", authorizedMiddleware, socialController.handleVote);

/**
 * 3. FAVORITES (VAULT)
 * Maps to /api/social/favorite/:id
 */
router.get("/favorites", authorizedMiddleware, socialController.getMyFavorites);
router.post("/favorite/:pickId", authorizedMiddleware, socialController.toggleFavorite);

export default router;