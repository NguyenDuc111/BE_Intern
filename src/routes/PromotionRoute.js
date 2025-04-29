import express from "express";
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../controllers/PromotionController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint xem danh sách khuyến mãi
router.get("/promotion", isAuthenticated, getAllPromotions);
//endpoint tạo khuyến mãi
router.post("/promo-add", isAuthenticated, isAdmin, createPromotion);
//endpoint cập nhật khuyến mãi
router.put("/promo-update/:id", isAuthenticated, isAdmin, updatePromotion);
//endpoint xóa khuyến mãi
router.delete("/promo-del/:id", isAuthenticated, isAdmin, deletePromotion);

export default router;
