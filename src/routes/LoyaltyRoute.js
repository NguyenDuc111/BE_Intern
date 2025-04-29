import express from "express";
import {
  redeemPoints,
  getLoyaltyPoints,
  getUserPointsByAdmin,
  updateLoyaltyPoint,
  deleteLoyaltyPoint,
} from "../controllers/LoyaltyController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
const router = express.Router();

//endpoint Lấy tổng điểm thưởng của người dùng
router.get("/point", isAuthenticated, getLoyaltyPoints);

//endpoint Sử dụng điểm thưởng
router.post("/redeem", isAuthenticated, redeemPoints);

//endpoint Xem chi tiết điểm của một người dùng (admin)
router.get("/point/:userId", isAuthenticated, isAdmin, getUserPointsByAdmin);

//endpoint Sửa bản ghi điểm tích lũy (admin)
router.put("/point-edit/:id", isAuthenticated, isAdmin, updateLoyaltyPoint);

//endpoint Xóa bản ghi điểm tích lũy (admin)
router.delete("/point-del/:id", isAuthenticated, isAdmin, deleteLoyaltyPoint);

export default router;
