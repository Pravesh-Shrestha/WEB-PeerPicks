import express from 'express';
import { protect } from '../middlewares/authorized.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import { getAllUsers, createUser } from '../controllers/auth.controller';

const router = express.Router();

// Apply both: Protect ensures they are logged in, isAdmin ensures they are an admin
router.get('/users', protect, isAdmin, getAllUsers);
router.post('/users', protect, isAdmin, createUser);

export default router;