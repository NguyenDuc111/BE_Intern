import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Orders, OrderDetails, Products, LoyaltyPoints, Promotions, Cart } =
  models;

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { items, pointsUsed, promotionId, cartItemIds } = req.body; // items: [{ ProductID, Quantity }], cartItemIds: [CartID]

    // Kiểm tra items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Items array is required and cannot be empty." });
    }

    // Tính tổng giá trị đơn hàng và kiểm tra tồn kho
    let totalAmount = 0;
    for (const item of items) {
      const product = await Products.findByPk(item.ProductID, { transaction });
      if (!product) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ error: `Product ${item.ProductID} not found.` });
      }
      if (product.StockQuantity < item.Quantity) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            error: `Not enough stock for ${product.ProductName}. Available: ${product.StockQuantity}, Requested: ${item.Quantity}.`,
          });
      }
      totalAmount += product.Price * item.Quantity;
    }

    // Áp dụng giảm giá từ điểm (1 điểm = 1,000 VND)
    let discountFromPoints = 0;
    if (pointsUsed > 0) {
      const points = await LoyaltyPoints.findAll({
        where: { UserID },
        transaction,
      });
      const totalPoints = points.reduce((sum, point) => sum + point.Points, 0);
      if (totalPoints < pointsUsed) {
        await transaction.rollback();
        return res.status(400).json({ error: "Not enough points." });
      }
      discountFromPoints = pointsUsed * 1000; // 1 điểm = 1,000 VND
      await LoyaltyPoints.create(
        {
          UserID,
          Points: -pointsUsed,
          Description: `Dùng ${pointsUsed} điểm để giảm giá đơn hàng`,
        },
        { transaction }
      );
    }

    // Áp dụng mã khuyến mãi
    let discountFromPromotion = 0;
    if (promotionId) {
      const promotion = await Promotions.findByPk(promotionId, { transaction });
      if (
        !promotion ||
        (promotion.UserID && promotion.UserID !== UserID) ||
        new Date() > promotion.EndDate
      ) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid or expired promotion." });
      }
      discountFromPromotion =
        promotion.DiscountValue ||
        (totalAmount * promotion.DiscountPercentage) / 100;
    }

    // Tổng giảm giá không vượt quá TotalAmount
    const totalDiscount = Math.min(
      discountFromPoints + discountFromPromotion,
      totalAmount
    );
    const finalAmount = totalAmount - totalDiscount;

    // Tạo đơn hàng
    const order = await Orders.create(
      {
        UserID,
        TotalAmount: finalAmount,
        Status: "pending",
      },
      { transaction }
    );

    // Tạo chi tiết đơn hàng và giảm tồn kho
    for (const item of items) {
      const product = await Products.findByPk(item.ProductID, { transaction });
      await OrderDetails.create(
        {
          OrderID: order.OrderID,
          ProductID: item.ProductID,
          Quantity: item.Quantity,
          Price: product.Price,
        },
        { transaction }
      );
      // Giảm số lượng tồn kho
      await product.update(
        { StockQuantity: product.StockQuantity - item.Quantity },
        { transaction }
      );
    }

    // Xóa sản phẩm khỏi giỏ hàng (nếu có cartItemIds)
    if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
      await Cart.destroy({
        where: { CartID: cartItemIds, UserID },
        transaction,
      });
    }

    await transaction.commit();
    res.status(201).json({
      message: "Order created successfully.",
      order,
      priceDetails: {
        totalAmountBeforeDiscount: totalAmount,
        discountFromPoints,
        discountFromPromotion,
        finalAmount,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Create order error: ${error.message}` });
  }
};

// Lấy danh sách đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const { UserID, isAdmin } = req.user;
    let where = {};
    if (!isAdmin) {
      where.UserID = UserID; // Người dùng chỉ thấy đơn hàng của mình
    }

    const orders = await Orders.findAll({
      where,
      include: [
        {
          model: OrderDetails,
          as: "OrderDetails",
          attributes: ["OrderDetailID", "ProductID", "Quantity", "Price"],
        },
      ],
      attributes: [
        "OrderID",
        "UserID",
        "TotalAmount",
        "Status",
        "CreatedAt",
        "UpdatedAt",
      ],
      order: [["CreatedAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: `Get orders error: ${error.message}` });
  }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { UserID, isAdmin } = req.user;

    const order = await Orders.findByPk(id, {
      include: [
        {
          model: OrderDetails,
          as: "OrderDetails",
          attributes: ["OrderDetailID", "ProductID", "Quantity", "Price"],
        },
      ],
      attributes: [
        "OrderID",
        "UserID",
        "TotalAmount",
        "Status",
        "CreatedAt",
        "UpdatedAt",
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (!isAdmin && order.UserID !== UserID) {
      return res.status(403).json({ error: "Unauthorized access to order." });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: `Get order error: ${error.message}` });
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { Status, TotalAmount } = req.body;

    const order = await Orders.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    // Kiểm tra trạng thái hợp lệ
    if (Status && !["pending", "completed", "cancelled"].includes(Status)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid status." });
    }

    // Kiểm tra TotalAmount
    if (TotalAmount !== undefined && TotalAmount < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "TotalAmount cannot be negative." });
    }

    // Cập nhật đơn hàng
    await order.update(
      {
        Status: Status || order.Status,
        TotalAmount:
          TotalAmount !== undefined ? TotalAmount : order.TotalAmount,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Order updated successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Update order error: ${error.message}` });
  }
};

// Xóa đơn hàng
export const deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await Orders.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    // Xóa chi tiết đơn hàng trước (do foreign key)
    await OrderDetails.destroy({ where: { OrderID: id }, transaction });

    // Xóa đơn hàng
    await order.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Delete order error: ${error.message}` });
  }
};

// Đánh dấu đơn hàng hoàn thành và tích điểm
export const completeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await Orders.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.Status === "completed") {
      await transaction.rollback();
      return res.status(400).json({ error: "Order is already completed." });
    }

    if (order.Status === "cancelled") {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Cannot complete a cancelled order." });
    }

    // Cập nhật trạng thái đơn hàng
    await order.update({ Status: "completed" }, { transaction });

    // Tính điểm thưởng: 1 điểm = 100,000 VND
    const points = Math.floor(order.TotalAmount / 100000);
    if (points > 0) {
      await LoyaltyPoints.create(
        {
          UserID: order.UserID,
          Points: points,
          Description: `Tích điểm từ đơn hàng #${id}`,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Order completed successfully.", pointsAdded: points });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Complete order error: ${error.message}` });
  }
};
