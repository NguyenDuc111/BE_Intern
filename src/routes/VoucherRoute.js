import express from "express";
import {
  getAvailableVouchers,
  redeemVoucher,
  applyVoucher,
  getRedeemedVouchers,
  addVoucher,
  editVoucher,
  deleteVoucher,
} from "../controllers/VoucherController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Lấy danh sách voucher có sẵn
router.get("/vouchers", isAuthenticated, getAvailableVouchers);
// Đổi điểm lấy voucher
router.post("/redeem-voucher", isAuthenticated, redeemVoucher);
// Áp dụng voucher trong giỏ hàng
router.post("/apply-voucher", isAuthenticated, applyVoucher);
// lấy voucher đã được đổi
router.get("/redeemed", isAuthenticated, getRedeemedVouchers);
/*---------------------admin------------------------------- */
router.post("/vouchers", isAuthenticated, isAdmin, addVoucher);
router.put("/vouchers/:VoucherID", isAuthenticated, isAdmin, editVoucher);
router.delete("/vouchers/:VoucherID", isAuthenticated, isAdmin, deleteVoucher);
export default router;
