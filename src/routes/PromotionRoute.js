import express from "express";
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
} from "../controllers/PromotionController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint lấy tất cả khuyến mãi
router.get("/promotion-all", getAllPromotions);
//endpoint lấy khuyến mãi theo ID
router.get("/promotion/:id", getPromotionById);
//endpoint thêm  khuyễn mãi
router.post("/promotion-add", isAuthenticated, isAdmin, createPromotion);
//endpoint cập nhật khuyến mãi
router.put("/promotion-update/:id", isAuthenticated, isAdmin, updatePromotion);
//endpoint xóa khuyến mãi
router.delete("/promotuon-delete/:id", isAuthenticated, isAdmin, deletePromotion);

export default router;
