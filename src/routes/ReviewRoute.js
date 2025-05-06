import express from "express";
import {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
  getAllReviews,
} from "../controllers/ReviewController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint tạo đánh giá
router.post("/review-add", isAuthenticated, createReview);
//endpoint lấy đánh giá theo ID sản phẩm
router.get("/review/product/:id", getReviewsByProduct);
//endpoint cập nhật đánh giá
router.put("/review-update/:id", isAuthenticated, updateReview);
//endpoint xóa đánh giá (của riêng người dùng hoặc admin)
router.delete("/review-delete/:id", isAuthenticated, deleteReview);
//enpoint lấy danh sách đánh giá (admin)
router.get("/review-all", isAuthenticated, isAdmin, getAllReviews);
export default router;
