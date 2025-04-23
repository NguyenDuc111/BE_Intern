import express from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategoriesToProduct,
  removeCategoriesFromProduct,
} from "../controllers/ProductController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

//endpoint lấy tất cả sản phẩm
router.get("/products", getAllProducts);
//endpoint xem chi tiết sản phẩm theo ID
router.get("/product/:id", getProductById);
//endpoint thêm sản phẩm (admin)
router.post("/product-add", isAuthenticated, isAdmin, addProduct);
//endpoint cập nhật sản phẩm
router.put("/product-update/:id", isAuthenticated, isAdmin, updateProduct);
//endpoint xóa sản phẩm
router.delete("/product-del/:id", isAuthenticated, isAdmin, deleteProduct);
//endpoint thêm danh mục vào sản phẩm
router.post('/product-add/:id/categories', isAuthenticated, isAdmin, addCategoriesToProduct);
//endpoint xóa danh mục khỏi sản phẩm 
router.delete('/product-del/:id/categories', isAuthenticated, isAdmin, removeCategoriesFromProduct); 

export default router;
