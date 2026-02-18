import { Router } from 'express';
import { pickController } from '../controllers/pick.controller';
import { socialController } from '../controllers/social.controller'; // Import the social controller
import { authorizedMiddleware } from '../middlewares/authorized.middleware';
import { uploads } from '../middlewares/upload.middleware';

const router = Router();

/**
 * PUBLIC ROUTES
 */
// 1. Social Feed (Discovery) - Instagram/Pinterest style
router.get('/feed', pickController.getDiscoveryFeed);

// 2. Individual Review details
router.get('/:id', pickController.getPick);

// 3. Get all reviews for a specific Google Maps Link (The Hub)
// Clicking the "Alias" on the frontend can call this to show everyone who visited
router.get('/place/:linkId', pickController.getPlaceProfile);

/**
 * PROTECTED ROUTES (Requires Token)
 */

// 4. Create Review: Supports up to 5 photos/videos via 'images' field
router.post(
    '/', 
    authorizedMiddleware, 
    uploads.array('images', 5), 
    pickController.createPick
);

// 5. Engagement: Support (Upvote/Downvote) toggle
// This handles the social interaction logic
router.post('/:id/support', authorizedMiddleware, socialController.handleSupport);

// 6. Update: Only the author can modify their caption or stars
router.patch('/:id', authorizedMiddleware, pickController.updatePick);

// 7. Delete: Strictly owner-only (or admin) deletion logic
router.delete('/:id', authorizedMiddleware, pickController.deletePick);

// 8. Profile: Fetch all posts by a specific user
router.get('/user/:userId', authorizedMiddleware, pickController.getUserPicks);

// 9. Category-based feed (e.g., "Food", "Cafe", "Nature")
router.get('/category/:category', pickController.getPicksByCategory);

//10.gET: Fetch all picks 
router.get('/', pickController.getAllPicks);
export default router;