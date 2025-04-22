import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} from "../controllers/CartController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

//endpoint thêm giỏ hàng
router.post("/cart-add", isAuthenticated, addToCart);
//endpoint lấy giỏ hàng theo ID người dùng
router.get("/cart/:CustomerID", isAuthenticated, getCart);
//endpoint chỉnh sửa giỏ hàng
router.put("/edit/:cartId", isAuthenticated, updateCart);
//endpoint xóa giỏ hàng
router.delete("/delete/:cartId", isAuthenticated, removeFromCart);
export default router;
