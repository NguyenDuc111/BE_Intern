import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/WishlistController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

//endpoint thêm yêu thích
router.post("/wishlist-add", isAuthenticated, addToWishlist);
//endpoint lấy danh sách sản phẩm yêu thích
router.get("/wishlist-all", isAuthenticated, getWishlist);
//endpoint xóa yêu thích
router.delete("/wishlist-del/:id", isAuthenticated, removeFromWishlist);

export default router;
