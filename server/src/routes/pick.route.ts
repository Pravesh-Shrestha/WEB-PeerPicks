import { Router } from 'express';
import { pickController } from '../controllers/pick.controller';
import { socialController } from '../controllers/social.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';
import { uploads } from '../middlewares/upload.middleware';

const router = Router();

/**
 * PUBLIC ROUTES
 */

// 1. Social Feed (Discovery) - Instagram/Pinterest style
router.get('/feed', pickController.getDiscoveryFeed);

// 3. Discussion: Fetch comments/replies for a specific pick
router.get('/:id/discussion', pickController.getPickDiscussion);

// 4. The Hub: Get all reviews for a specific Google Maps Place
router.get('/place/:linkId', pickController.getPlaceProfile);

// 5. Category-based feed (e.g., "Food", "Cafe", "Nature")
router.get('/category/:category', pickController.getPicksByCategory);

// 6. Fetch all picks (Admin/Global)
router.get('/', pickController.getAllPicks);


// 2. Individual Review details
router.get('/:id', pickController.getPick);

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

// 8. Discussion: Post a new comment to a pick
router.post('/:pickId/comment', authorizedMiddleware, socialController.postComment);

// 9. Engagement: Support (Upvote/Downvote) toggle
router.post('/:pickId/vote', authorizedMiddleware, socialController.handleVote);

// 10. Social: Follow/Unfollow User toggle
router.post('/user/:targetUserId/follow', authorizedMiddleware, socialController.toggleFollow);

// 11. Update: Only the author can modify
router.patch('/:id', authorizedMiddleware, pickController.updatePick);

// 12. Delete: Strictly owner-only removal
router.delete('/:id', authorizedMiddleware, pickController.deletePick);

// 13. Profile: Fetch all posts by a specific user
router.get('/user/:userId', authorizedMiddleware, pickController.getUserPicks);

export default router;