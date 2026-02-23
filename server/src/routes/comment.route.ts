import { Router } from 'express';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';
import { CommentController } from '../controllers/comment.controller';

const router = Router();
const commentController = new CommentController();

/**
 * THREAD PROTOCOL [2026-02-01]
 * All comment-related actions require an authenticated user.
 */
router.use(authorizedMiddleware);

/**
 * @route   POST /api/social/comment
 * @desc    Create a new comment signal
 */
router.post('/', commentController.createComment);

/**
 * @route   PATCH /api/social/comment/:id
 * @desc    Update comment text
 * Note: Un-commented to provide full CRUD capability
 */
router.patch('/:id', commentController.updateComment);

/**
 * @route   DELETE /api/social/comment/:id
 * @desc    Delete a specific comment [2026-02-01 Protocol]
 * Protocol Adherence: Terminology "delete" is strictly enforced here.
 */
router.delete('/:id', commentController.deleteComment);

export default router;