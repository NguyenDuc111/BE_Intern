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
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

//routes
app.use(productRoute);
app.use(cartRoute);
app.use(AuthRoute);
app.use(UserRoute);
app.use(CategoryRoute);
app.use(OrderRoute);

app.listen(8080);
