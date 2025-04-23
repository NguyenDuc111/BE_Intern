import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  completeOrder,
} from "../controllers/OrderController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint tạo đơn hàng
router.post("/order-add", isAuthenticated, createOrder);
//endpoint lấy danh sách đơn hàng
router.get("/order", isAuthenticated, getAllOrders);
//endpoint xem chi tiết đơn hàng
router.get("/order/:id", isAuthenticated, getOrderById);
//endpoint cập nhật đơn hàng
router.put("/order-update/:id", isAuthenticated, updateOrder);
//endpoint xóa đơn hàng (admin)
router.delete("/order-del/:id", isAuthenticated, isAdmin, deleteOrder);
//endpoint
router.post("/order/:id/complete", isAuthenticated, isAdmin, completeOrder);

export default router;
