import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import {
  createOrderService,
  orderReturnService,
} from "../config/vnpayService.js";

const models = initModels(sequelize);
const {
  Orders,
  OrderDetails,
  Products,
  LoyaltyPoints,
  Promotion,
  Cart,
  TempOrderItems,
} = models;

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { items, pointsUsed, promotionId, cartItemIds, shippingAddress } =
      req.body;

    // Kiểm tra items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Items array is required and cannot be empty." });
    }

    // Kiểm tra shippingAddress
    if (!shippingAddress || typeof shippingAddress !== "string") {
      await transaction.rollback();
      return res.status(400).json({ error: "Shipping address is required." });
    }

    // Tính tổng giá trị đơn hàng và kiểm tra tồn kho
    let totalAmount = 0;
    for (const item of items) {
      if (!item.ProductID || !item.Quantity || item.Quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid item format." });
      }
      const product = await Products.findByPk(item.ProductID, { transaction });
      if (!product) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ error: `Product ${item.ProductID} not found.` });
      }
      if (product.StockQuantity < item.Quantity) {
        await transaction.rollback();
        return res.status(400).json({
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
      discountFromPoints = pointsUsed * 1000;
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
      const promotion = await Promotion.findByPk(promotionId, { transaction });
      if (
        !promotion ||
        (promotion.UserID && promotion.UserID !== UserID) ||
        new Date() < promotion.StartDate ||
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
        PromotionID: promotionId || null,
        TotalAmount: finalAmount.toFixed(2),
        Status: "Pending",
        ShippingAddress: shippingAddress,
      },
      { transaction }
    );

    // Lưu items tạm vào TempOrderItems
    for (const item of items) {
      await TempOrderItems.create(
        {
          OrderID: order.OrderID,
          ProductID: item.ProductID,
          Quantity: item.Quantity,
        },
        { transaction }
      );
    }

    // Xóa sản phẩm khỏi giỏ hàng
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
      items,
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

// Xử lý thanh toán với VNPay
export const processPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { orderId, paymentMethod } = req.body;

    const order = await Orders.findByPk(orderId, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    // Kiểm tra quyền truy cập
    if (order.UserID !== UserID) {
      await transaction.rollback();
      return res.status(403).json({ error: "Unauthorized access to order." });
    }

    if (paymentMethod === "vnpay") {
      // Tạo URL thanh toán VNPay
      const orderInfo = `Thanh toán đơn hàng #${order.OrderID}`;
      const returnUrl = "http://localhost:5173/Cart ";
      const paymentUrl = await createOrderService(
        req,
        parseInt(order.TotalAmount),
        orderInfo,
        returnUrl,
        order.OrderID
      );

      // Cập nhật trạng thái thành Processing
      await order.update({ Status: "Processing" }, { transaction });
      await transaction.commit();
      return res.status(200).json({
        message: "Redirect to VNPay payment page",
        payUrl: paymentUrl,
      });
    } else {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid payment method." });
    }
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Process payment error: ${error.message}` });
  }
};

// Xử lý callback từ VNPay
export const vnpayCallback = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await orderReturnService(req);
    const orderId = req.query.vnp_TxnRef;

    const order = await Orders.findByPk(orderId, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    if (result === 1) {
      await order.update({ Status: "Paid" }, { transaction });
      const tempItems = await TempOrderItems.findAll({
        where: { OrderID: order.OrderID },
        transaction,
      });

      for (const item of tempItems) {
        const product = await Products.findByPk(item.ProductID, {
          transaction,
        });
        if (!product) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ error: `Product ${item.ProductID} not found.` });
        }
        if (product.StockQuantity < item.Quantity) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Not enough stock for ${product.ProductName}. Available: ${product.StockQuantity}, Requested: ${item.Quantity}.`,
          });
        }

        await OrderDetails.create(
          {
            OrderID: order.OrderID,
            ProductID: item.ProductID,
            Quantity: item.Quantity,
            UnitPrice: product.Price,
          },
          { transaction }
        );

        await product.update(
          { StockQuantity: product.StockQuantity - item.Quantity },
          { transaction }
        );
      }

      await TempOrderItems.destroy({
        where: { OrderID: order.OrderID },
        transaction,
      });

      await transaction.commit();
      return res.redirect("/payment/success");
    } else {
      await order.update({ Status: "Cancelled" }, { transaction });
      await TempOrderItems.destroy({
        where: { OrderID: order.OrderID },
        transaction,
      });
      await transaction.commit();
      return res.redirect("/payment/failed");
    }
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `VNPay callback error: ${error.message}` });
  }
};

// Lấy danh sách đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const { UserID, isAdmin } = req.user;
    let where = {};
    if (!isAdmin) {
      where.UserID = UserID;
    }

    const orders = await Orders.findAll({
      where,
      include: [
        {
          model: OrderDetails,
          as: "OrderDetails",
          attributes: ["OrderDetailID", "ProductID", "Quantity", "UnitPrice"],
        },
      ],
      attributes: [
        "OrderID",
        "UserID",
        "PromotionID",
        "TotalAmount",
        "Status",
        "ShippingAddress",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
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
          attributes: ["OrderDetailID", "ProductID", "Quantity", "UnitPrice"],
        },
      ],
      attributes: [
        "OrderID",
        "UserID",
        "PromotionID",
        "TotalAmount",
        "Status",
        "ShippingAddress",
        "createdAt",
        "updatedAt",
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
    const { Status, TotalAmount, ShippingAddress } = req.body;

    const order = await Orders.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    if (
      Status &&
      !["Pending", "Processing", "Paid", "Cancelled"].includes(Status)
    ) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid status." });
    }

    if (TotalAmount !== undefined && TotalAmount < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "TotalAmount cannot be negative." });
    }

    await order.update(
      {
        Status: Status || order.Status,
        TotalAmount:
          TotalAmount !== undefined ? TotalAmount : order.TotalAmount,
        ShippingAddress: ShippingAddress || order.ShippingAddress,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Order updated successfully.", order });
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

    await OrderDetails.destroy({ where: { OrderID: id }, transaction });
    await TempOrderItems.destroy({ where: { OrderID: id }, transaction });
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

    if (order.Status === "Paid") {
      await transaction.rollback();
      return res.status(400).json({ error: "Order is already completed." });
    }

    if (order.Status === "Cancelled") {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Cannot complete a cancelled order." });
    }

    await order.update({ Status: "Paid" }, { transaction });

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
