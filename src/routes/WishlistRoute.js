import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/WishlistController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/wishlist-add", isAuthenticated, addToWishlist);
router.get("/wishlist-all", isAuthenticated, getWishlist);
router.delete("/wishlist-delete/:id", isAuthenticated, removeFromWishlist);

export default router;
