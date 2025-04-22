import express from 'express';
    import { getProfile, updateProfile } from '../controllers/UserController.js';
    import isAuthenticated from '../middleware/auth.js';

    const router = express.Router();

    //API lấy thông tin cá nhân
    router.get('/profile', isAuthenticated, getProfile);
    //API chỉnh sửa thông tin người dùng
    router.put('/update-profile', isAuthenticated, updateProfile);

    export default router;