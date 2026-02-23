import { Router } from 'express';
import { pickController } from '../controllers/pick.controller';
import { socialController } from '../controllers/social.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';
import { uploads } from '../middlewares/upload.middleware';

const router = Router();

/**
 * PUBLIC ROUTES
 * Rule: Static paths must come BEFORE dynamic :id paths to avoid 404/collisions.
 */

// 1. Social Feed (Discovery)
router.get('/feed', pickController.getDiscoveryFeed);

// 2. The Hub: Specific Google Maps Place
router.get('/place/:linkId', pickController.getPlaceProfile);

// 3. Category-based feed
router.get('/category/:category', pickController.getPicksByCategory);

// 4. Fetch all picks (Admin/Global)
router.get('/', pickController.getAllPicks);

// 5. Individual Review details 
// This is dynamic, so it stays below static paths
router.get('/:id', pickController.getPick);

// 6. Discussion: Fetch comments for a specific pick
// Ensure this matches API.COMMENTS.GET_BY_PICK in endpoints.ts
router.get('/:id/discussion', pickController.getPickDiscussion);

/**
 * PROTECTED ROUTES (Requires Token)
 */

// 7. Create Review: Supports up to 5 photos/videos
router.post(
    '/', 
    authorizedMiddleware, 
    uploads.array('images', 5), 
    pickController.createPick
);

// 8. User Profile Feed (Protected)
router.get('/user/:userId', authorizedMiddleware, pickController.getUserPicks);

// 9. Engagement: Support (Upvote/Downvote) toggle
router.post('/:pickId/vote', authorizedMiddleware, socialController.handleVote);

// 10. Social: Follow/Unfollow User toggle
router.post('/user/:targetUserId/follow', authorizedMiddleware, socialController.toggleFollow);

// 11. Update: Only the author can modify
router.patch('/:id', authorizedMiddleware, pickController.updatePick);

/**
 * 12. Delete: Strictly owner-only removal
 * Terminology aligned with [2026-02-01] Protocol
 */
router.delete('/:id', authorizedMiddleware, pickController.deletePick);

export default router;