import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  completeOrder,
  processPayment,
  vnpayCallback,
} from "../controllers/OrderController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/*--------------------User----------------- */
//endpoint tạo đơn hàng
router.post("/order-add", isAuthenticated, createOrder);
//endpoint lấy danh sách đơn hàng
router.get("/order", isAuthenticated, getAllOrders);
router.get("/order-user/:id", isAuthenticated,  getOrderById);

/*--------------------Admin----------------- */
//endpoint xem chi tiết đơn hàng
router.get("/order/:id", isAuthenticated, isAdmin, getOrderById);
//endpoint cập nhật đơn hàng
router.put("/order-update/:id", isAuthenticated, isAdmin, updateOrder);
//endpoint xóa đơn hàng
router.delete("/order-del/:id", isAuthenticated, isAdmin, deleteOrder);
//endpoint đơn hàng thành công
router.post("/order/:id/complete", isAuthenticated, isAdmin, completeOrder);

/*--------------------Payment---------------*/
// Xử lý thanh toán
router.post("/payment", isAuthenticated, processPayment);
// Callback từ VNPay
router.get("/vnpay/callback", vnpayCallback);
export default router;
