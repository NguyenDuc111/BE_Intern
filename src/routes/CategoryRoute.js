import express from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoryController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint lấy danh sách danh mục
router.get("/categories", getAllCategories);
//endpoint thêm danh mục
router.post("/cate-add", isAuthenticated, isAdmin, createCategory);
//endpoint cập nhật danh mục
router.put("/cate-update/:id", isAuthenticated, isAdmin, updateCategory);
//endpoint xóa danh mục
router.delete("/cate-del/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;
