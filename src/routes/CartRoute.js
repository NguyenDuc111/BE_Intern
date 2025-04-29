import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  deleteFromCart,
} from "../controllers/CartController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

//endpoint thêm giỏ hàng
router.post("/cart-add", isAuthenticated, addToCart);
//endpoint lấy giỏ hàng theo ID người dùng
router.get("/cart", isAuthenticated, getCart);
//endpoint chỉnh sửa giỏ hàng
router.put("/cart-edit/:id", isAuthenticated, updateCart);
//endpoint xóa giỏ hàng
router.delete("/del/:id", isAuthenticated, deleteFromCart);

export default router;
