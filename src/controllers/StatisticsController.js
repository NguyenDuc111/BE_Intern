import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";

const models = initModels(sequelize);
const { OrderDetails, Orders, Products, Users } = models;

// Thống kê doanh thu theo sản phẩm, tổng doanh thu, và dữ liệu tổng quan
export const getRevenueStatistics = async (req, res) => {
  try {
    console.log("getRevenueStatistics called with query:", req.query);
    const { startDate, endDate } = req.query;

    // Xây dựng điều kiện trạng thái Paid
    const where = {
      Order: {
        Status: "Paid",
      },
    };

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

    // Tính tổng số đơn hàng
    const totalOrders = await Orders.count({
      where: { Status: "Paid" },
    });

    // Tính tổng số người dùng
    const totalUsers = await Users.count();

    // Tính tổng số sản phẩm
    const totalProducts = await Products.count();

    // Dữ liệu cho biểu đồ: Doanh thu theo sản phẩm
    const chartData = productStats.map((stat) => ({
      name: stat.ProductName,
      total: parseFloat(stat.totalRevenue),
    }));

    // Định dạng kết quả
    const result = {
      products: productStats.map((stat) => ({
        ProductID: stat.ProductID,
        ProductName: stat.ProductName,
        totalQuantity: parseInt(stat.totalQuantity),
        totalRevenue: parseFloat(stat.totalRevenue),
      })),
      totalRevenueAll,
      totalOrders,
      totalUsers,
      totalProducts,
      chart: chartData,
    };

    console.log("Returning statistics:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Lỗi khi lấy thống kê doanh thu:",
      error.message,
      error.stack
    );
    res
      .status(500)
      .json({ error: `Lỗi khi lấy thống kê doanh thu: ${error.message}` });
  }
};
