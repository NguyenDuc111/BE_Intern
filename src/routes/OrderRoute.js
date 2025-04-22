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

router.post("/checkout", isAuthenticated, checkout);
router.get("/order", isAuthenticated, getOrders);
router.get("/oder/:id", isAuthenticated, getOrderById);
router.put("/update-order/:id", isAuthenticated, updateOrder);
router.delete("/delete/:id", isAuthenticated, deleteOrder);
export default router;
