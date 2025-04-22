import express from "express";
import {
  checkout,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/OrderController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

//endpoint kiểm tra giỏ hàng
router.post("/checkout", isAuthenticated, checkout);
//endpoint lấy  giỏ hàng 
router.get("/order", isAuthenticated, getOrders);
//endpoint lấy giỏ hàng theo ID (lịch sử)
router.get("/oder/:id", isAuthenticated, getOrderById);
//endpoint chỉnh sửa giỏ hàng 
router.put("/update-order/:id", isAuthenticated, updateOrder);
//endpoint xóa giỏ hàng 
router.delete("/delete/:id", isAuthenticated, deleteOrder);

export default router;
