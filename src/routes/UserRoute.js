import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/UserController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint lấy tất cả danh sách người dùng (admin)
router.get("/user-all", isAuthenticated, isAdmin, getAllUsers);
//endpoint lấy thông tin chi tiết của người dùng
router.get("/user-profile/:id", isAuthenticated, getUserById);
//endpoint cập nhật thông tin của người dùng
router.put("/update-profile/:id", isAuthenticated, updateUser);
//endpoint xóa người dùng (admin)
router.delete("/delete-user/:id", isAuthenticated, isAdmin, deleteUser);

export default router;
