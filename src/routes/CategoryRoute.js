import express from "express";
import {
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
} from "../controllers/CategoryController.js";

const router = express.Router();

router.get("/categories", getAllCategories);
router.get("/category/:id", getCategoryById);
router.get("/category/:id/products", getProductsByCategory);

export default router;
