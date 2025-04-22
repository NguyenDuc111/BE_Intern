import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRoute from "./routes/ProductRoute.js";
import cartRoute from "./routes/CartRoute.js";
import errorHandler from "./middleware/errorHandler.js";
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";

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
app.listen(8080);
