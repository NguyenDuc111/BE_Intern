import express from 'express';
    import { getProfile } from '../controllers/UserController.js';
    import isAuthenticated from '../middleware/auth.js';

    const router = express.Router();

    //API lấy thông tin cá nhân
    router.get('/profile', isAuthenticated, getProfile);

    export default router;