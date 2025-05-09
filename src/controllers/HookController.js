import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";

// Initialize models
const models = initModels(sequelize);
const {
  Products,
  Orders,
  ProductCategories,
  Categories,
  Promotions,
  Notification,
} = models;

export const handleWebhook = async (req, res) => {
  const queryText = req.body.queryResult?.queryText;
  if (!queryText) {
    return res.status(400).json({
      fulfillmentText: "Yêu cầu không hợp lệ. Vui lòng cung cấp queryText.",
    });
  }

  try {
    switch (queryText) {
      case "product_info":
        return res.json({
          fulfillmentText:
            "Sản phẩm Cholimex bao gồm các loại tương ớt, gia vị, và thực phẩm đóng gói, được sản xuất từ nguyên liệu tự nhiên, đạt chuẩn an toàn thực phẩm.",
        });

      case "product_ingredients":
        const productsIngredients = await Products.findAll({
          limit: 3,
          attributes: ["ProductName", "Ingredients", "ImageURL"],
        });
        if (!productsIngredients || productsIngredients.length === 0) {
          return res.json({
            fulfillmentText:
              "Hiện tại chưa có thông tin thành phần sản phẩm. Vui lòng kiểm tra chi tiết trên bao bì hoặc liên hệ hỗ trợ.",
          });
        }
        return res.json({
          fulfillmentText:
            "Dưới đây là thành phần của một số sản phẩm Cholimex:",
          products: productsIngredients.map((p) => ({
            ProductName: p.ProductName,
            Ingredients: p.Ingredients || "Chưa cập nhật thành phần",
            imageUrl: p.ImageURL || "https://example.com/placeholder.jpg",
          })),
        });

      case "product_quality":
        return res.json({
          fulfillmentText:
            "Sản phẩm Cholimex đạt chứng nhận ISO 22000 và HACCP, được kiểm định bởi Bộ Y tế Việt Nam, đảm bảo chất lượng và an toàn.",
        });

      case "order_process":
        return res.json({
          fulfillmentText:
            "Để đặt hàng, bạn chọn sản phẩm, thêm vào giỏ hàng, nhập thông tin giao hàng và thanh toán qua website. Đơn hàng sẽ được xác nhận qua email.",
        });

      case "add_to_cart":
        return res.json({
          fulfillmentText:
            "Trên trang sản phẩm, nhấp vào nút 'Thêm vào giỏ hàng'. Bạn có thể điều chỉnh số lượng trong giỏ hàng trước khi thanh toán.",
        });

      case "checkout_steps":
        return res.json({
          fulfillmentText:
            "1. Xem giỏ hàng và kiểm tra sản phẩm. 2. Nhập địa chỉ giao hàng. 3. Chọn phương thức thanh toán (VNPay hoặc COD). 4. Xác nhận đơn hàng.",
        });

      case "payment_options":
        return res.json({
          fulfillmentText:
            "Cholimex hỗ trợ thanh toán qua VNPay (thẻ ngân hàng, ví điện tử) và thanh toán khi nhận hàng (COD).",
        });

      case "vnpay_payment":
        return res.json({
          fulfillmentText:
            "Thanh toán qua VNPay rất an toàn, sử dụng mã hóa SSL. Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất.",
        });

      case "cod_payment":
        return res.json({
          fulfillmentText:
            "Có, Cholimex hỗ trợ thanh toán khi nhận hàng (COD). Bạn chỉ cần trả tiền cho nhân viên giao hàng khi nhận sản phẩm.",
        });

      case "delivery_info":
        return res.json({
          fulfillmentText:
            "Giao hàng từ 2-5 ngày làm việc, tùy khu vực. Phí giao hàng từ 20,000-50,000 VND, miễn phí cho đơn từ 500,000 VND.",
        });

      case "delivery_time":
        return res.json({
          fulfillmentText:
            "Thời gian giao hàng nội thành TP.HCM là 1-2 ngày, các khu vực khác từ 3-5 ngày làm việc.",
        });

      case "delivery_fees":
        return res.json({
          fulfillmentText:
            "Phí giao hàng từ 20,000-50,000 VND, tùy khu vực. Miễn phí giao hàng cho đơn hàng từ 500,000 VND trở lên.",
        });

      case "voucher_points":
        let promoText = "Hiện tại không có mã khuyến mãi nào. ";
        try {
          const activePromos = await Promotions.findAll({
            where: {
              StartDate: { [Op.lte]: new Date() },
              EndDate: { [Op.gte]: new Date() },
            },
            limit: 3,
            attributes: ["Code", "DiscountPercentage"],
          });

          if (activePromos && activePromos.length > 0) {
            promoText = `Hiện có các mã khuyến mãi: ${activePromos
              .map((p) => `${p.Code} (giảm ${p.DiscountPercentage}%)`)
              .join(", ")}. `;
          }
        } catch (promoError) {
          console.error(
            "Error fetching promotions:",
            promoError.message,
            promoError.stack
          );
          promoText =
            "Không thể lấy thông tin khuyến mãi. Vui lòng kiểm tra lại sau. ";
        }

        return res.json({
          fulfillmentText: `${promoText}Bạn nhận 1 điểm tích lũy cho mỗi 100,000 VND mua sắm. Điểm có thể đổi voucher trong mục 'Tài khoản'.`,
        });

      case "redeem_voucher":
        return res.json({
          fulfillmentText:
            "Đăng nhập vào tài khoản, vào mục 'Điểm tích lũy', chọn voucher muốn đổi và xác nhận. Mã voucher sẽ được gửi qua email.",
        });

      case "apply_voucher":
        return res.json({
          fulfillmentText:
            "Trong trang thanh toán, nhập mã voucher vào ô 'Mã giảm giá' và nhấn 'Áp dụng'. Hệ thống sẽ kiểm tra và giảm giá nếu hợp lệ.",
        });

      case "customer_support":
        return res.json({
          fulfillmentText:
            "Liên hệ qua hotline, email hoặc chatbot trên website. Đội ngũ hỗ trợ sẽ phản hồi nhanh chóng trong giờ làm việc.",
        });

      case "support_contact":
        return res.json({
          fulfillmentText: `Email: ${
            process.env.EMAIL_USER || "support@cholimex.vn"
          }. Hotline: 1800-123-456 (miễn phí).`,
        });

      case "support_hours":
        return res.json({
          fulfillmentText:
            "Hỗ trợ từ 8:00 đến 17:00, thứ Hai đến thứ Bảy, trừ ngày lễ.",
        });

      case "return_policy":
        return res.json({
          fulfillmentText:
            "Cholimex hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi, hư hỏng hoặc không đúng mô tả. Liên hệ hỗ trợ để được hướng dẫn.",
        });

      case "return_conditions":
        return res.json({
          fulfillmentText:
            "Sản phẩm phải còn nguyên vẹn, chưa sử dụng, có bao bì gốc và kèm hóa đơn. Không áp dụng cho sản phẩm đã mở nắp.",
        });

      case "return_process":
        return res.json({
          fulfillmentText:
            "Liên hệ qua hotline hoặc email, cung cấp mã đơn hàng và lý do đổi trả. Cholimex sẽ hướng dẫn quy trình chi tiết.",
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
