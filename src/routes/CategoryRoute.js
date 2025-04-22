import express from "express";
import {
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
} from "../controllers/CategoryController.js";

const router = express.Router();

//endpoint lấy tất cả danh mục
router.get("/categories", getAllCategories);
//endpoint lấy từng danh mục riêng
router.get("/category/:id", getCategoryById);
//endpoint lấy sản phẩm theo danh mục
router.get("/category/:id/products", getProductsByCategory);

export default router;
