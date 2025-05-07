import express from "express";
import {
  getAvailableVouchers,
  redeemVoucher,
  applyVoucher,
  getRedeemedVouchers,
} from "../controllers/VoucherController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Lấy danh sách voucher có sẵn
router.get("/vouchers", isAuthenticated, getAvailableVouchers);
// Đổi điểm lấy voucher
router.post("/redeem-voucher", isAuthenticated, redeemVoucher);
// Áp dụng voucher trong giỏ hàng
router.post("/apply-voucher", isAuthenticated, applyVoucher);
// lấy voucher đã được đổi
router.get("/redeemed", isAuthenticated, getRedeemedVouchers);
export default router;
