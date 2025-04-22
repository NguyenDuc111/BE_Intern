import express from 'express';
    import { signUp, signIn, forgotPassword, changePassword } from '../controllers/AuthController.js';
    import isAuthenticated from '../middleware/auth.js';

    const router = express.Router();

    //router đăng ký
    router.post('/signup', signUp);
    //router đăng nhập
    router.post('/login', signIn);
    //router quên mật khẩu
    router.post('/forgot-password', forgotPassword);
    //router đổi mật khẩu
    router.post('/change-password', isAuthenticated, changePassword);

    export default router;