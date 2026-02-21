import { Router } from "express";
import { socialController } from "../controllers/social.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();

// Connections
router.post("/follow/:targetUserId", authorizedMiddleware, socialController.toggleFollow);

// Consensus (Voting)
router.post("/vote/:pickId", authorizedMiddleware, socialController.handleVote);

// Discussions
router.post("/comment/:pickId", authorizedMiddleware, socialController.postComment);
router.patch("/comment/:commentId", authorizedMiddleware, socialController.updateComment);
router.delete("/comment/:commentId", authorizedMiddleware, socialController.deleteComment);

// Favorites
// Add this to your backend social.route.ts
router.post("/favorite/:pickId", authorizedMiddleware, socialController.toggleFavorite);
router.get("/favorites", authorizedMiddleware, socialController.getMyFavorites);

export default router;