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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

//routes
app.use(AuthRoute);
app.use(cartRoute);
app.use(CategoryRoute);
app.use(NotificationRoute);
app.use(OrderRoute);
app.use(productRoute);
app.use(PromotionRoute);
app.use(ReviewRoute);
app.use(UserRoute);
app.use(WishlistRoute);
app.use(LoyaltyRoute);

app.listen(8080);
