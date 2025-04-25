import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

// Khởi tạo models
const models = initModels(sequelize);
const { Products, Orders, ProductCategories, Categories, Promotion } = models;

export const handleWebhook = async (req, res) => {
  // Log toàn bộ request để debug
  console.log("Webhook request received:", JSON.stringify(req.body, null, 2));

  // Lấy intentId và displayName
  const intentId = req.body.queryResult.intent.id;
  const intentDisplayName = req.body.queryResult.intent.displayName;
  console.log("Intent ID:", intentId);
  console.log("Intent Display Name:", intentDisplayName);

  // Intent: Kiểm tra hàng tồn kho (check_stock)
  if (intentId === "6ba7b810-9dad-11d1-80b4-00c04fd430c8" || intentDisplayName === "check_stock") {
    const productName = req.body.queryResult.parameters.product_name;
    console.log("Processing check_stock for product:", productName);
    try {
      const product = await Products.findOne({ where: { ProductName: productName } });
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
        fulfillmentText: "Có lỗi xảy ra khi kiểm tra hàng tồn kho. Vui lòng thử lại sau.",
      });
    }
  }

  // Intent: Lấy sản phẩm mới nhất (get_latest_product)
  if (intentId === "6ba7b813-9dad-11d1-80b4-00c04fd430c8" || intentDisplayName === "get_latest_product") {
    console.log("Processing get_latest_product");
    try {
      const latestProduct = await Products.findOne({
        order: [["CreatedAt", "DESC"]],
        limit: 1,
      });
      if (!latestProduct) {
        return res.json({
          fulfillmentText: "Hiện tại chưa có sản phẩm mới nào của Cholimex.",
        });
      }
      return res.json({
        fulfillmentText: `Sản phẩm mới nhất của Cholimex là ${latestProduct.ProductName}, được ra mắt vào ${new Date(latestProduct.CreatedAt).toLocaleDateString("vi-VN")}.`,
      });
    } catch (error) {
      console.error("Error in get_latest_product:", error);
      return res.json({
        fulfillmentText: "Có lỗi xảy ra khi lấy thông tin sản phẩm mới nhất. Vui lòng thử lại sau.",
      });
    }
  }

  // Intent: Kiểm tra trạng thái đơn hàng (check_order_status)
  if (intentId === "6ba7b817-9dad-11d1-80b4-00c04fd430c8" || intentDisplayName === "check_order_status") {
    const orderId = req.body.queryResult.parameters.order_id;
    console.log("Processing check_order_status for order:", orderId);
    try {
      const order = await Orders.findOne({ where: { OrderID: orderId } });
      if (!order) {
        return res.json({
          fulfillmentText: `Xin lỗi, tôi không tìm thấy đơn hàng ${orderId}. Bạn có thể kiểm tra lại mã đơn hàng không?`,
        });
      }
      return res.json({
        fulfillmentText: `Đơn hàng ${orderId} hiện đang ở trạng thái: ${order.OrderStatus}.`,
      });
    } catch (error) {
      console.error("Error in check_order_status:", error);
      return res.json({
        fulfillmentText: "Có lỗi xảy ra khi kiểm tra trạng thái đơn hàng. Vui lòng thử lại sau.",
      });
    }
  }

  // Intent: Tìm sản phẩm theo danh mục (find_products_by_category)
  if (intentId === "6ba7b818-9dad-11d1-80b4-00c04fd430c8" || intentDisplayName === "find_products_by_category") {
    const categoryName = req.body.queryResult.parameters.category;
    console.log("Processing find_products_by_category for category:", categoryName);
    try {
      const category = await Categories.findOne({ where: { CategoryName: categoryName } });
      if (!category) {
        return res.json({
          fulfillmentText: `Xin lỗi, tôi không tìm thấy danh mục ${categoryName}. Bạn có thể thử danh mục khác không?`,
        });
      }
      const productCategories = await ProductCategories.findAll({
        where: { CategoryID: category.CategoryID },
        include: [{ model: Products, as: "Product" }],
      });
      if (!productCategories || productCategories.length === 0) {
        return res.json({
          fulfillmentText: `Hiện tại không có sản phẩm nào trong danh mục ${categoryName}.`,
        });
      }
      const productNames = productCategories.map(pc => pc.Product.ProductName).join(", ");
      return res.json({
        fulfillmentText: `Các sản phẩm trong danh mục ${categoryName} là: ${productNames}.`,
      });
    } catch (error) {
      console.error("Error in find_products_by_category:", error);
      return res.json({
        fulfillmentText: "Có lỗi xảy ra khi tìm sản phẩm theo danh mục. Vui lòng thử lại sau.",
      });
    }
  }

  // Intent: Lấy thông tin khuyến mãi (get_promotions)
  if (intentId === "6ba7b819-9dad-11d1-80b4-00c04fd430c8" || intentDisplayName === "get_promotions") {
    console.log("Processing get_promotions");
    try {
      const promotions = await Promotion.findAll({
        where: {
          StartDate: { [sequelize.Op.lte]: new Date() },
          EndDate: { [sequelize.Op.gte]: new Date() },
        },
      });
      if (!promotions || promotions.length === 0) {
        return res.json({
          fulfillmentText: "Hiện tại không có chương trình khuyến mãi nào đang diễn ra tại Cholimex.",
        });
      }
      const promoDetails = promotions.map(p => `${p.PromotionName} (giảm ${p.DiscountPercentage}%, từ ${new Date(p.StartDate).toLocaleDateString("vi-VN")} đến ${new Date(p.EndDate).toLocaleDateString("vi-VN")})`).join("; ");
      return res.json({
        fulfillmentText: `Các chương trình khuyến mãi đang diễn ra tại Cholimex: ${promoDetails}.`,
      });
    } catch (error) {
      console.error("Error in get_promotions:", error);
      return res.json({
        fulfillmentText: "Có lỗi xảy ra khi lấy thông tin khuyến mãi. Vui lòng thử lại sau.",
      });
    }
  }

  // Intent: Kiểm tra giá sản phẩm (check_price)
  if (intentId === "6ba7b820-9dad-11d1-80b4-00c04fd430c8" || intentDisplayName === "check_price") {
    const productName = req.body.queryResult.parameters.product_name;
    console.log("Processing check_price for product:", productName);
    try {
      const product = await Products.findOne({ where: { ProductName: productName } });
      if (!product) {
        return res.json({
          fulfillmentText: `Xin lỗi, tôi không tìm thấy sản phẩm ${productName}. Bạn có thể thử tên sản phẩm khác không?`,
        });
      }
      return res.json({
        fulfillmentText: `Sản phẩm ${productName} có giá ${product.Price} VND.`,
      });
    } catch (error) {
      console.error("Error in check_price:", error);
      return res.json({
        fulfillmentText: "Có lỗi xảy ra khi kiểm tra giá sản phẩm. Vui lòng thử lại sau.",
      });
    }
  }

  // Intent: Kiểm tra thành phần sản phẩm (check_ingredients)
  if (intentId === "6ba7b822-9dad-11d1-80b4-00c04fd430c8" || intentDisplayName === "check_ingredients") {
    const productName = req.body.queryResult.parameters.product_name;
    console.log("Processing check_ingredients for product:", productName);
    try {
      const product = await Products.findOne({ where: { ProductName: productName } });
      if (!product) {
        return res.json({
          fulfillmentText: `Xin lỗi, tôi không tìm thấy sản phẩm ${productName}. Bạn có thể thử tên sản phẩm khác không?`,
        });
      }
      if (!product.Ingredients) {
        return res.json({
          fulfillmentText: `Hiện tại chưa có thông tin về thành phần của sản phẩm ${productName}.`,
        });
      }
      return res.json({
        fulfillmentText: `Thành phần của ${productName} gồm: ${product.Ingredients}.`,
      });
    } catch (error) {
      console.error("Error in check_ingredients:", error);
      return res.json({
        fulfillmentText: "Có lỗi xảy ra khi kiểm tra thành phần sản phẩm. Vui lòng thử lại sau.",
      });
    }
  }

  // Xử lý các intent khác nếu cần
  return res.json({
    fulfillmentText: "Tôi chưa được cấu hình để xử lý yêu cầu này.",
  });
};