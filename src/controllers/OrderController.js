import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Cart, Products, Orders, OrderDetails } = models;

export const checkout = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const customerId = req.customer.CustomerID;

    // Lấy giỏ hàng
    const cartItems = await Cart.findAll({
      where: { CustomerID: customerId },
      include: [
        {
          model: Products,
          as: "Product",
          attributes: ["ProductID", "Price", "StockQuantity"],
        },
      ],
    });

    if (!cartItems.length) {
      await transaction.rollback();
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Tính tổng tiền
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += item.Product.Price * item.Quantity;
    }

    // Kiểm tra tồn kho
    for (const item of cartItems) {
      if (item.Product.StockQuantity < item.Quantity) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            error: `Insufficient stock for product ID ${item.ProductID}`,
          });
      }
    }

    // Tạo đơn hàng
    const order = await Orders.create(
      {
        CustomerID: customerId,
        TotalAmount: totalAmount,
        Status: "pending",
      },
      { transaction }
    );

    // Tạo chi tiết đơn hàng và cập nhật tồn kho
    for (const item of cartItems) {
      await OrderDetails.create(
        {
          OrderID: order.OrderID,
          ProductID: item.ProductID,
          Quantity: item.Quantity,
          Price: item.Product.Price,
        },
        { transaction }
      );

      await Products.update(
        { StockQuantity: item.Product.StockQuantity - item.Quantity },
        { where: { ProductID: item.ProductID }, transaction }
      );
    }

    // Xóa giỏ hàng
    await Cart.destroy({ where: { CustomerID: customerId }, transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Order created successfully", orderId: order.OrderID });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const customerId = req.customer.CustomerID;

    const orders = await Orders.findAll({
      where: { CustomerID: customerId },
      attributes: [
        "OrderID",
        "TotalAmount",
        "Status",
        "CreatedAt",
        "UpdatedAt",
      ],
    });

    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const customerId = req.customer.CustomerID;
    const { id } = req.params;

    const order = await Orders.findOne({
      where: { OrderID: id, CustomerID: customerId },
      include: [
        {
          model: OrderDetails,
          as: "OrderDetails",
          attributes: ["OrderDetailID", "ProductID", "Quantity", "Price"],
          include: [
            {
              model: Products,
              as: "Product",
              attributes: ["ProductName", "ImageURL"],
            },
          ],
        },
      ],
      attributes: [
        "OrderID",
        "TotalAmount",
        "Status",
        "CreatedAt",
        "UpdatedAt",
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order retrieved successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const customerId = req.customer.CustomerID;
    const { id } = req.params;
    const { Status } = req.body;

    if (!Status || !["pending", "completed", "cancelled"].includes(Status)) {
      return res
        .status(400)
        .json({
          error: "Valid Status is required (pending, completed, cancelled)",
        });
    }

    const order = await Orders.findOne({
      where: { OrderID: id, CustomerID: customerId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ Status });

    res.status(200).json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const customerId = req.customer.CustomerID;
    const { id } = req.params;

    const order = await Orders.findOne({
      where: { OrderID: id, CustomerID: customerId },
      include: [
        {
          model: OrderDetails,
          as: "OrderDetails",
          attributes: ["ProductID", "Quantity"],
        },
      ],
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // Hoàn lại tồn kho
    for (const detail of order.OrderDetails) {
      const product = await Products.findByPk(detail.ProductID, {
        transaction,
      });
      await product.update(
        { StockQuantity: product.StockQuantity + detail.Quantity },
        { transaction }
      );
    }

    // Xóa đơn hàng
    await order.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};
