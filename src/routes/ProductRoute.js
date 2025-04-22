import express from 'express';
    import { getAllProducts, getProductById } from '../controllers/ProductController.js';

    const router = express.Router();

    //endpoint lấy tất cả sản phẩm
    router.get('/products', getAllProducts);
    //endpoint lấy sản phẩm theo ID
    router.get('/product/:id', getProductById);

    export default router;