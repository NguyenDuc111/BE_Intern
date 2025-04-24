import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";

const models = initModels(sequelize);
const { OrderDetails, Orders, Products } = models;

// Thống kê doanh thu theo sản phẩm và tổng doanh thu (chỉ đơn hàng Paid)
export const getRevenueStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Xây dựng điều kiện thời gian và trạng thái Paid
    const where = {
      Order: {
        Status: "Paid",
      },
    };
    if (startDate && endDate) {
      where.Order.CreatedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Lấy danh sách sản phẩm với số lượng và doanh thu
    const productStats = await OrderDetails.findAll({
      attributes: [
        [sequelize.col("Product.ProductID"), "ProductID"],
        [sequelize.col("Product.ProductName"), "ProductName"],
        [
          sequelize.fn("SUM", sequelize.col("OrderDetails.Quantity")),
          "totalQuantity",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("OrderDetails.Quantity * OrderDetails.UnitPrice")
          ),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: Products,
          as: "Product",
          attributes: [],
        },
        {
          model: Orders,
          as: "Order",
          attributes: [],
          where: where.Order,
        },
      ],
      group: ["Product.ProductID", "Product.ProductName"],
      raw: true,
    });

    // Tính tổng doanh thu của tất cả sản phẩm
    const totalRevenueAll = productStats.reduce(
      (sum, stat) => sum + parseFloat(stat.totalRevenue),
      0
    );

    // Định dạng kết quả
    const result = {
      products: productStats.map((stat) => ({
        ProductID: stat.ProductID,
        ProductName: stat.ProductName,
        totalQuantity: parseInt(stat.totalQuantity),
        totalRevenue: parseFloat(stat.totalRevenue),
      })),
      totalRevenueAll: totalRevenueAll,
    };

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Get revenue statistics error: ${error.message}` });
  }
};
