import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from 'sequelize';

// Initialize models
const models = initModels(sequelize);
const { Products, Orders, ProductCategories, Categories, Promotion } = models;

export const handleWebhook = async (req, res) => {
  console.log("Webhook request received:", JSON.stringify(req.body, null, 2));

  // Validate query text
  const queryText = req.body.queryResult?.queryText;
  if (!queryText) {
    console.error("No queryText provided in request");
    return res.status(400).json({
      fulfillmentText: "Yêu cầu không hợp lệ. Vui lòng cung cấp queryText.",
    });
  }

  console.log("User query:", queryText);

  try {
    switch (queryText) {
      case "product_safety":
        return res.json({
          fulfillmentText:
            "Sản phẩm Cholimex được sản xuất tại nhà máy đạt chuẩn ISO 22000 và HACCP, sử dụng nguyên liệu tự nhiên, an toàn và được kiểm định chất lượng bởi các cơ quan chức năng.",
        });

      case "product_ingredients":
        const productsIngredients = await Products.findAll({
          limit: 3,
          attributes: ["ProductName", "Ingredients", "imageUrl"],
          order: [[ "DESC"]],
        });
        if (!productsIngredients || productsIngredients.length === 0) {
          console.log("No products found for ingredients");
          return res.json({
            fulfillmentText:
              "Hiện tại chưa có thông tin thành phần sản phẩm. Vui lòng kiểm tra chi tiết trên bao bì hoặc liên hệ hỗ trợ.",
          });
        }
        return res.json({
          fulfillmentText: "Dưới đây là thành phần của một số sản phẩm:",
          products: productsIngredients.map((p) => ({
            ProductName: p.ProductName,
            Ingredients: p.Ingredients || "Chưa cập nhật thành phần",
            imageUrl: p.imageUrl || "https://example.com/placeholder.jpg",
          })),
        });

      case "product_certification":
        return res.json({
          fulfillmentText:
            "Tất cả sản phẩm Cholimex đều đạt chứng nhận ISO 22000, HACCP và được cấp phép bởi Bộ Y tế Việt Nam, đảm bảo an toàn thực phẩm.",
        });

      case "product_price":
        const productsPricing = await Products.findAll({
          limit: 3,
          attributes: ["ProductName", "Price", "imageUrl"],
          order: [[ "DESC"]],
        });
        if (!productsPricing || productsPricing.length === 0) {
          console.log("No products found for pricing");
          return res.json({
            fulfillmentText:
              "Hiện tại chưa có thông tin giá sản phẩm. Vui lòng xem chi tiết trên trang sản phẩm.",
          });
        }
        return res.json({
          fulfillmentText: "Dưới đây là giá của một số sản phẩm:",
          products: productsPricing.map((p) => ({
            ProductName: p.ProductName,
            Price: p.Price || 0,
            imageUrl: p.imageUrl || "https://example.com/placeholder.jpg",
          })),
        });

      case "max_discount_percentage":
        const maxDiscountPromo = await Promotion.findOne({
          where: {
            StartDate: { [Op.lte]: new Date() },
            EndDate: { [Op.gte]: new Date() },
          },
          order: [["DiscountPercentage", "DESC"]],
        });
        if (!maxDiscountPromo) {
          console.log("No active promotions found for max discount");
          return res.json({
            fulfillmentText:
              "Hiện tại không có chương trình giảm giá nào. Vui lòng kiểm tra lại sau.",
          });
        }
        return res.json({
          fulfillmentText: `Giảm giá tối đa hiện tại là ${
            maxDiscountPromo.DiscountPercentage
          }% cho mã "${maxDiscountPromo.Code}" (đến ${new Date(
            maxDiscountPromo.EndDate
          ).toLocaleDateString("vi-VN")}).`,
        });

      case "max_discount_amount":
        return res.json({
          fulfillmentText:
            "Mức giảm giá tối đa bằng tiền phụ thuộc vào tổng hóa đơn. Ví dụ, với chương trình giảm 10% cho hóa đơn từ 500,000 VND, bạn có thể tiết kiệm tối đa 50,000 VND. Vui lòng xem chi tiết trên trang khuyến mãi.",
        });

      case "special_offers":
        const specialPromo = await Promotion.findOne({
          where: {
            StartDate: { [Op.lte]: new Date() },
            EndDate: { [Op.gte]: new Date() },
          },
          order: sequelize.random(), 
        });
        if (!specialPromo) {
          console.log("No special offers found");
          return res.json({
            fulfillmentText:
              "Hiện tại không có ưu đãi đặc biệt nào. Vui lòng kiểm tra lại sau hoặc liên hệ hỗ trợ qua hotline 1800-123-456.",
          });
        }
        return res.json({
          fulfillmentText: `Ưu đãi đặc biệt hiện tại: Mã "${
            specialPromo.Code
          }", giảm ${specialPromo.DiscountPercentage}% đến ${new Date(
            specialPromo.EndDate
          ).toLocaleDateString("vi-VN")}.`,
        });

      case "promo_points":
        const activePromos = await Promotion.findAll({
          where: {
            StartDate: { [Op.lte]: new Date() },
            EndDate: { [Op.gte]: new Date() },
          },
          limit: 3,
          order: [["StartDate", "DESC"]],
        });
        const promoText =
          activePromos.length > 0
            ? `Hiện tại có các mã khuyến mãi: ${activePromos
                .map((p) => `${p.Code} (giảm ${p.DiscountPercentage}%)`)
                .join(", ")}. `
            : "Hiện tại không có mã khuyến mãi nào. ";
        return res.json({
          fulfillmentText: `${promoText}Về điểm tích lũy, bạn nhận 1 điểm cho mỗi 100,000 VND mua sắm. Điểm có thể đổi thành voucher giảm giá (ví dụ: 10 điểm = 50,000 VND) trong mục 'Tài khoản' trên website.`,
        });

      case "active_promo_codes":
        const activePromoCodes = await Promotion.findAll({
          where: {
            StartDate: { [Op.lte]: new Date() },
            EndDate: { [Op.gte]: new Date() },
          },
          limit: 3,
          order: [["StartDate", "DESC"]],
        });
        if (!activePromoCodes || activePromoCodes.length === 0) {
          console.log("No active promo codes found");
          return res.json({
            fulfillmentText:
              "Hiện tại không có mã khuyến mãi nào. Vui lòng kiểm tra lại sau hoặc xem trên trang khuyến mãi.",
          });
        }
        const promoCodeList = activePromoCodes
          .map(
            (p) =>
              `${p.Code}: Giảm ${p.DiscountPercentage}% đến ${new Date(
                p.EndDate
              ).toLocaleDateString("vi-VN")}`
          )
          .join("; ");
        return res.json({
          fulfillmentText: `Mã khuyến mãi hiện tại: ${promoCodeList}.`,
        });

      case "points_usage":
        return res.json({
          fulfillmentText:
            "Bạn tích lũy 1 điểm cho mỗi 100,000 VND mua sắm. Điểm có thể đổi thành voucher giảm giá (ví dụ: 10 điểm = 50,000 VND) trong mục 'Tài khoản' trên website. Vui lòng đăng nhập để kiểm tra điểm.",
        });

      case "delivery":
        return res.json({
          fulfillmentText:
            "Thời gian giao hàng của Cholimex thường từ 2-5 ngày làm việc, tùy khu vực. Đơn hàng nội thành TP.HCM có thể giao trong 1-2 ngày.",
        });

      case "delivery_fees":
        return res.json({
          fulfillmentText:
            "Phí giao hàng từ 20,000 đến 50,000 VND, tùy khu vực. Miễn phí giao hàng cho đơn từ 500,000 VND trở lên.",
        });

      case "delivery_tracking":
        const sampleOrder = await Orders.findOne({
          order: [[ "DESC"]],
        });
        if (!sampleOrder) {
          console.log("No orders found for tracking example");
          return res.json({
            fulfillmentText:
              "Bạn có thể theo dõi đơn hàng trong mục 'Lịch sử thanh toán' trên website hoặc liên hệ hỗ trợ để được cung cấp mã theo dõi.",
          });
        }
        return res.json({
          fulfillmentText: `Bạn có thể theo dõi đơn hàng trong mục 'Lịch sử thanh toán' trên website. Ví dụ: Đơn hàng #${sampleOrder.OrderID} hiện ở trạng thái ${sampleOrder.OrderStatus}.`,
        });

      case "storage":
        return res.json({
          fulfillmentText:
            "Sản phẩm Cholimex nên được bảo quản ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp để giữ chất lượng tốt nhất.",
        });

      case "shelf_life":
        const productsShelfLife = await Products.findAll({
          limit: 3,
          attributes: ["ProductName"],
          order: [[ "DESC"]],
        });
        if (!productsShelfLife || productsShelfLife.length === 0) {
          console.log("No products found for shelf life");
          return res.json({
            fulfillmentText:
              "Hạn sử dụng của sản phẩm Cholimex thường từ 12-24 tháng. Vui lòng kiểm tra ngày hết hạn trên bao bì.",
          });
        }
        const shelfLifeList = productsShelfLife
          .map((p) => `${p.ProductName}: Thường 12-24 tháng từ ngày sản xuất`)
          .join("; ");
        return res.json({
          fulfillmentText: `Hạn sử dụng của một số sản phẩm: ${shelfLifeList}. Kiểm tra ngày hết hạn trên bao bì.`,
        });

      case "storage_instructions":
        return res.json({
          fulfillmentText:
            "Bảo quản sản phẩm ở nhiệt độ phòng, đậy kín nắp sau khi mở. Nên sử dụng trong vòng 1-2 tháng sau khi mở để đảm bảo chất lượng.",
        });

      case "customer_support":
        return res.json({
          fulfillmentText:
            "Bạn có thể liên hệ bộ phận hỗ trợ khách hàng của Cholimex qua email, hotline hoặc chatbot trên website để được hỗ trợ nhanh chóng.",
        });

      case "support_contact":
        return res.json({
          fulfillmentText: `Email hỗ trợ: ${
            process.env.EMAIL_USER || "support@cholimex.vn"
          }. Hotline: 1800-123-456 (miễn phí).`,
        });

      case "support_hours":
        return res.json({
          fulfillmentText:
            "Hỗ trợ khách hàng hoạt động từ 8:00 đến 17:00, thứ Hai đến thứ Bảy, trừ ngày lễ.",
        });

      case "return_policy":
        return res.json({
          fulfillmentText:
            "Cholimex hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm lỗi, hư hỏng hoặc không đúng mô tả.",
        });

      case "return_conditions":
        return res.json({
          fulfillmentText:
            "Sản phẩm đổi trả phải còn nguyên vẹn, chưa sử dụng, có bao bì gốc và kèm hóa đơn. Không áp dụng cho sản phẩm đã mở nắp hoặc sử dụng.",
        });

      case "return_process":
        return res.json({
          fulfillmentText:
            "Để đổi trả, vui lòng liên hệ hỗ trợ qua hotline hoặc email, cung cấp mã đơn hàng và mô tả lý do. Chúng tôi sẽ hướng dẫn quy trình chi tiết.",
        });

      default:
        return res.json({
          fulfillmentText:
            "Vui lòng chọn một câu hỏi từ danh sách để tôi hỗ trợ bạn!",
        });
    }
  } catch (error) {
    console.error("Error in webhook:", error.message, error.stack);
    return res.status(500).json({
      fulfillmentText: "Có lỗi xảy ra ở server. Vui lòng thử lại sau.",
    });
  }
};
