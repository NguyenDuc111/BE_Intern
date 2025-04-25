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

const app = express();

// Khởi tạo models
const models = initModels(sequelize);
const { Products } = models;

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
app.use(StatisticsRoute);

// Webhook cho Dialogflow
app.post("/webhook", async (req, res) => {
  const intentId = req.body.queryResult.intent.id; // Sử dụng ID thay vì displayName
  const parameters = req.body.queryResult.parameters;

  // Intent: Kiểm tra hàng tồn kho (check_stock)
  if (intentId === "6ba7b810-9dad-11d1-80b4-00c04fd430c8") {
    const productName = parameters.product_name;
    try {
      const product = await Products.findOne({
        where: { ProductName: productName },
      });
      if (!product) {
        return res.json({
          fulfillmentText: `Xin lỗi, tôi không tìm thấy sản phẩm ${productName}. Bạn có thể thử tên sản phẩm khác không?`,
        });
      }
      return res.json({
        fulfillmentText: `Sản phẩm ${productName} có ${product.StockQuantity} hàng tồn kho.`,
      });
    } catch (error) {
      console.error("Error in check_stock:", error);
      return res.json({
        fulfillmentText:
          "Có lỗi xảy ra khi kiểm tra hàng tồn kho. Vui lòng thử lại sau.",
      });
    }
  }

  // Intent: Lấy sản phẩm mới nhất (get_latest_product)
  if (intentId === "6ba7b813-9dad-11d1-80b4-00c04fd430c8") {
    try {
      const latestProduct = await Products.findOne({
        order: [["CreatedAt", "DESC"]],
        limit: 1,
      });
      if (!latestProduct) {
        return res.json({
          fulfillmentText: "Hiện tại chưa có sản phẩm mới nào.",
        });
      }
      return res.json({
        fulfillmentText: `Sản phẩm mới nhất là ${
          latestProduct.ProductName
        }, được ra mắt vào ${new Date(
          latestProduct.CreatedAt
        ).toLocaleDateString("vi-VN")}.`,
      });
    } catch (error) {
      console.error("Error in get_latest_product:", error);
      return res.json({
        fulfillmentText:
          "Có lỗi xảy ra khi lấy thông tin sản phẩm mới nhất. Vui lòng thử lại sau.",
      });
    }
  }

  // Xử lý các intent khác nếu cần
  return res.json({
    fulfillmentText: "Tôi chưa được cấu hình để xử lý yêu cầu này.",
  });
});

app.listen(8080);
