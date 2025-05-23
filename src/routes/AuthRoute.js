import express from "express";
import {
  signup,
  forgotPassword,
  changePassword,
  login,
  resetPassword,
} from "../controllers/AuthController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

//endpoint đăng ký
router.post("/signup", signup);
//endpoint đăng nhập
router.post("/login", login);
//endpoint quên mật khẩu
router.post("/forgot-password", forgotPassword);
//endpoint reset mật khẩu bằng link 
router.post("/reset-password", resetPassword);
//endpoint đổi mật khẩu
router.post("/change-password", isAuthenticated, changePassword);

export default router;