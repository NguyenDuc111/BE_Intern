import express from 'express';
    import { createCartItem, getCartItems } from '../controllers/CartController.js';

    const router = express.Router();

    //router thêm giỏ hàng
    router.post('/cart-add', createCartItem);
    //router lấy giỏ hàng theo ID người dùng
    router.get('/cart/:CustomerID', getCartItems);

    export default router;