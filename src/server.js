import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRoute from "./routes/ProductRoute.js";
import cartRoute from "./routes/CartRoute.js";
import errorHandler from "./middleware/errorHandler.js";
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import OrderRoute from "./routes/OrderRoute.js";
import ReviewRoute from "./routes/ReviewRoute.js";
import NotificationRoute from "./routes/NotificationRoute.js";
import WishlistRoute from "./routes/WishlistRoute.js";
import PromotionRoute from "./routes/PromotionRoute.js";
import LoyaltyRoute from "./routes/LoyaltyRoute.js";
import StatisticsRoute from "./routes/StatisticsRoute.js";
import sequelize from "../src/config/db.js";
import initModels from "../src/models/init-models.js";
import HookRoute from "./routes/HookRoute.js";
import VoucherRoute from "./routes/VoucherRoute.js";
const app = express();

app.use(express.json());

// Khởi tạo models
const models = initModels(sequelize);
const { Products } = models;

app.use(cors());
app.use(express.json());
app.use(errorHandler);

//routes
app.use('/api' +AuthRoute);
app.use('/api' +cartRoute);
app.use('/api' +CategoryRoute);
app.use('/api' +NotificationRoute);
app.use('/api' +OrderRoute);
app.use('/api' +productRoute);
app.use('/api' +PromotionRoute);
app.use('/api' +ReviewRoute);
app.use('/api' +UserRoute);
app.use('/api' +WishlistRoute);
app.use('/api' +LoyaltyRoute);
app.use('/api' +StatisticsRoute);
app.use('/api' +HookRoute);
app.use('/api' +VoucherRoute);

app.listen(8081);
