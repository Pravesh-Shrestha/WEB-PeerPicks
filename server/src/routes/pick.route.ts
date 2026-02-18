import { Router } from 'express';
import { pickController } from '../controllers/pick.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';
import { uploads } from '../middlewares/upload.middleware';

const router = Router();

// Public
router.get('/feed', pickController.getDiscoveryFeed);
router.get('/:id', pickController.getPick);

// Protected (Requires Token)
// Ensure 'images' matches the Key name in Postman exactly
router.post('/', authorizedMiddleware, uploads.array('images', 5), pickController.createPick);
router.patch('/:id', authorizedMiddleware, pickController.updatePick);
router.delete('/:id', authorizedMiddleware, pickController.deletePick);
router.get('/user/:userId', pickController.getUserPicks);

export default router;