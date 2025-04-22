import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRoute from "./routes/ProductRoute.js";
import cartRoute from "./routes/CartRoute.js";
import errorHandler from "./middleware/errorHandler.js";
import Authroute from "./routes/AuthRoute.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

//routes
app.use(productRoute);
app.use(cartRoute);
app.use(Authroute);

app.listen(8080);
