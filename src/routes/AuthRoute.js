import express from 'express';
    import { signUp, signIn, forgotPassword, changePassword } from '../controllers/AuthController.js';
    import isAuthenticated from '../middleware/auth.js';

    const router = express.Router();

    //endpoint đăng ký
    router.post('/signup', signUp);
    //endpoint đăng nhập
    router.post('/login', signIn);
    //endpoint quên mật khẩu
    router.post('/forgot-password', forgotPassword);
    //endpoint đổi mật khẩu
    router.post('/change-password', isAuthenticated, changePassword);

    export default router;