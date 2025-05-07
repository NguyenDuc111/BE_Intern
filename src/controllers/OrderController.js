import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";
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
  Cart,
  TempOrderItems,
  UserVouchers,
  Vouchers,
} = models;

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { items, pointsUsed, voucherCode, cartItemIds, shippingAddress } =
      req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Mảng sản phẩm là bắt buộc và không được rỗng." });
    }

    if (!shippingAddress || typeof shippingAddress !== "string") {
      await transaction.rollback();
      return res.status(400).json({ error: "Địa chỉ giao hàng là bắt buộc." });
    }

    if (!Number.isInteger(pointsUsed) || pointsUsed < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Số điểm sử dụng không hợp lệ." });
    }

    // Tính tổng giá trị đơn hàng và kiểm tra tồn kho
    let totalAmount = 0;
    for (const item of items) {
      if (
        !Number.isInteger(item.ProductID) ||
        !Number.isInteger(item.Quantity) ||
        item.Quantity <= 0
      ) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Định dạng sản phẩm không hợp lệ." });
      }
      const product = await Products.findByPk(item.ProductID, { transaction });
      if (!product) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ error: `Không tìm thấy sản phẩm ${item.ProductID}.` });
      }
      if (product.StockQuantity < item.Quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Không đủ hàng tồn kho cho ${product.ProductName}. Số lượng có sẵn: ${product.StockQuantity}, Số lượng yêu cầu: ${item.Quantity}.`,
        });
      }
      totalAmount += product.Price * item.Quantity;
    }

    // Áp dụng giảm giá từ điểm
    let discountFromPoints = 0;
    if (pointsUsed > 0) {
      const points = await LoyaltyPoints.findAll({
        where: { UserID },
        transaction,
      });
      const totalPoints = points.reduce((sum, point) => sum + point.Points, 0);
      if (totalPoints < pointsUsed) {
        await transaction.rollback();
        return res.status(400).json({ error: "Không đủ điểm để sử dụng." });
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

    // Áp dụng mã voucher
    let discountFromVoucher = 0;
    let isPercentage = false;
    let userVoucher = null;
    if (voucherCode) {
      userVoucher = await UserVouchers.findOne({
        where: { UserID, Code: voucherCode },
        include: [{ model: Vouchers, as: "Voucher" }],
        transaction,
      });

      if (!userVoucher) {
        await transaction.rollback();
        return res.status(400).json({ error: "Mã voucher không hợp lệ." });
      }
      if (userVoucher.Status !== "active") {
        await transaction.rollback();
        return res.status(400).json({
          error: `Mã voucher đã ${
            userVoucher.Status === "used" ? "được sử dụng hết" : "hết hạn"
          }.`,
        });
      }
      if (new Date(userVoucher.ExpiryDate) < new Date()) {
        await userVoucher.update({ Status: "expired" }, { transaction });
        await transaction.rollback();
        return res.status(400).json({ error: "Mã voucher đã hết hạn." });
      }
      if (userVoucher.UsageCount >= userVoucher.Voucher.UsageLimit) {
        await userVoucher.update({ Status: "used" }, { transaction });
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Mã voucher đã đạt giới hạn sử dụng." });
      }

      discountFromVoucher = userVoucher.Voucher.DiscountValue;
      isPercentage = userVoucher.Voucher.DiscountValue <= 100;
    }

    const finalAmount =
      totalAmount -
      discountFromPoints -
      (isPercentage
        ? (totalAmount * discountFromVoucher) / 100
        : discountFromVoucher);
    if (finalAmount < 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Tổng giá trị đơn hàng không được âm." });
    }

    // Tạo đơn hàng
    const order = await Orders.create(
      {
        UserID,
        VoucherCode: voucherCode || null,
        TotalAmount: parseFloat(finalAmount.toFixed(2)),
        Status: "Pending",
        ShippingAddress: shippingAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
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
      const validCartItems = await Cart.findAll({
        where: { CartID: cartItemIds, UserID },
        transaction,
      });
      if (validCartItems.length !== cartItemIds.length) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Một số mục trong giỏ hàng không hợp lệ." });
      }
      await Cart.destroy({
        where: { CartID: cartItemIds, UserID },
        transaction,
      });
    }

    await transaction.commit();
    const response = {
      message: "Đã tạo đơn hàng thành công.",
      order,
      items,
      priceDetails: {
        totalAmountBeforeDiscount: totalAmount,
        discountFromPoints,
        discountFromVoucher: isPercentage
          ? (totalAmount * discountFromVoucher) / 100
          : discountFromVoucher,
        finalAmount,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ error: `Lỗi khi tạo đơn hàng: ${error.message}` });
  }
};

// Xử lý thanh toán với VNPay hoặc COD
export const processPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { orderId, paymentMethod } = req.body;

    const order = await Orders.findByPk(orderId, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (order.UserID !== UserID) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ error: "Không có quyền truy cập vào đơn hàng." });
    }

    if (paymentMethod === "cod") {
      // For COD, set status to Paid and update voucher
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
            .json({ error: `Không tìm thấy sản phẩm ${item.ProductID}.` });
        }
        if (product.StockQuantity < item.Quantity) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Không đủ hàng tồn kho cho ${product.ProductName}. Số lượng có sẵn: ${product.StockQuantity}, Số lượng yêu cầu: ${item.Quantity}.`,
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

      // Update voucher if used
      if (order.VoucherCode) {
        const userVoucher = await UserVouchers.findOne({
          where: { UserID, Code: order.VoucherCode },
          include: [{ model: Vouchers, as: "Voucher" }],
          transaction,
        });

        if (userVoucher && userVoucher.Status === "active") {
          await userVoucher.update(
            { UsageCount: userVoucher.UsageCount + 1 },
            { transaction }
          );
          if (userVoucher.UsageCount + 1 >= userVoucher.Voucher.UsageLimit) {
            await userVoucher.update({ Status: "used" }, { transaction });
          }
        }
      }

      // Update order status to Paid
      await order.update(
        { Status: "Paid", updatedAt: new Date() },
        { transaction }
      );

      await transaction.commit();
      return res.status(200).json({
        message: "Đặt hàng COD thành công.",
        order,
      });
    } else if (paymentMethod === "vnpay") {
      const orderInfo = `Thanh toán đơn hàng #${order.OrderID}`;
      const returnUrl = "http://localhost:8080/vnpay/callback";
      const paymentUrl = await createOrderService(
        req,
        parseInt(order.TotalAmount),
        orderInfo,
        returnUrl,
        order.OrderID
      );

      await order.update(
        { Status: "Processing", updatedAt: new Date() },
        { transaction }
      );
      await transaction.commit();
      return res.status(200).json({
        message: "Chuyển hướng đến trang thanh toán VNPay",
        payUrl: paymentUrl,
      });
    } else {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Phương thức thanh toán không hợp lệ." });
    }
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi xử lý thanh toán: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (result === 1) {
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
            .json({ error: `Không tìm thấy sản phẩm ${item.ProductID}.` });
        }
        if (product.StockQuantity < item.Quantity) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Không đủ hàng tồn kho cho ${product.ProductName}. Số lượng có sẵn: ${product.StockQuantity}, Số lượng yêu cầu: ${item.Quantity}.`,
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

      // Update voucher if used
      if (order.VoucherCode) {
        const userVoucher = await UserVouchers.findOne({
          where: { UserID: order.UserID, Code: order.VoucherCode },
          include: [{ model: Vouchers, as: "Voucher" }],
          transaction,
        });

        if (userVoucher && userVoucher.Status === "active") {
          await userVoucher.update(
            { UsageCount: userVoucher.UsageCount + 1 },
            { transaction }
          );
          if (userVoucher.UsageCount + 1 >= userVoucher.Voucher.UsageLimit) {
            await userVoucher.update({ Status: "used" }, { transaction });
          }
        }
      }

      await order.update(
        { Status: "Paid", updatedAt: new Date() },
        { transaction }
      );

      await transaction.commit();
      return res.redirect(
        `http://localhost:5173/payment/success?orderId=${orderId}&status=success`
      );
    } else {
      await order.update(
        { Status: "Cancelled", updatedAt: new Date() },
        { transaction }
      );
      await TempOrderItems.destroy({
        where: { OrderID: order.OrderID },
        transaction,
      });
      await transaction.commit();
      return res.redirect(
        `http://localhost:5173/payment/failed?orderId=${orderId}&status=failed&message=${encodeURIComponent(
          result === -1 ? "Invalid signature" : "Giao dịch VNPay thất bại"
        )}`
      );
    }
  } catch (error) {
    await transaction.rollback();
    return res.redirect(
      `http://localhost:5173/payment/failed?orderId=${
        req.query.vnp_TxnRef || "unknown"
      }&status=error&message=${encodeURIComponent(error.message)}`
    );
  }
};

// Lấy danh sách đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const { UserID, isAdmin } = req.user;
    const where = {};
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
        "VoucherCode",
        "TotalAmount",
        "Status",
        "ShippingAddress",
      ],
    });
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách đơn hàng: ${error.message}` });
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
        "VoucherCode",
        "TotalAmount",
        "Status",
        "ShippingAddress",
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (!isAdmin && order.UserID !== UserID) {
      return res
        .status(403)
        .json({ error: "Không có quyền truy cập vào đơn hàng." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res
      .status(500)
      .json({ error: `Lỗi khi lấy chi tiết đơn hàng: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (
      Status &&
      !["Pending", "Processing", "Paid", "Cancelled"].includes(Status)
    ) {
      await transaction.rollback();
      return res.status(400).json({ error: "Trạng thái không hợp lệ." });
    }

    if (TotalAmount !== undefined && TotalAmount < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Tổng giá trị không được âm." });
    }

    await order.update(
      {
        Status: Status || order.Status,
        TotalAmount:
          TotalAmount !== undefined ? TotalAmount : order.TotalAmount,
        ShippingAddress: ShippingAddress || order.ShippingAddress,
        updatedAt: new Date(),
      },
      { transaction }
    );

    // Update voucher if status changes to Paid
    if (Status === "Paid" && order.VoucherCode) {
      const userVoucher = await UserVouchers.findOne({
        where: { UserID: order.UserID, Code: order.VoucherCode },
        include: [{ model: Vouchers, as: "Voucher" }],
        transaction,
      });

      if (userVoucher && userVoucher.Status === "active") {
        await userVoucher.update(
          { UsageCount: userVoucher.UsageCount + 1 },
          { transaction }
        );
        if (userVoucher.UsageCount + 1 >= userVoucher.Voucher.UsageLimit) {
          await userVoucher.update({ Status: "used" }, { transaction });
        }
      }
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Đã cập nhật đơn hàng thành công.", order });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi cập nhật đơn hàng:", error);
    res
      .status(500)
      .json({ error: `Lỗi khi cập nhật đơn hàng: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    await OrderDetails.destroy({ where: { OrderID: id }, transaction });
    await TempOrderItems.destroy({ where: { OrderID: id }, transaction });
    await order.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa đơn hàng thành công." });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi xóa đơn hàng:", error);
    res.status(500).json({ error: `Lỗi khi xóa đơn hàng: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (order.Status === "Paid") {
      await transaction.rollback();
      return res.status(400).json({ error: "Đơn hàng đã được hoàn thành." });
    }

    if (order.Status === "Cancelled") {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Không thể hoàn thành đơn hàng đã bị hủy." });
    }

    await order.update(
      { Status: "Paid", updatedAt: new Date() },
      { transaction }
    );

    // Update voucher if used
    if (order.VoucherCode) {
      const userVoucher = await UserVouchers.findOne({
        where: { UserID: order.UserID, Code: order.VoucherCode },
        include: [{ model: Vouchers, as: "Voucher" }],
        transaction,
      });

      if (userVoucher && userVoucher.Status === "active") {
        await userVoucher.update(
          { UsageCount: userVoucher.UsageCount + 1 },
          { transaction }
        );
        if (userVoucher.UsageCount + 1 >= userVoucher.Voucher.UsageLimit) {
          await userVoucher.update({ Status: "used" }, { transaction });
        }
      }
    }

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
    res.status(200).json({
      message: "Đã hoàn thành đơn hàng thành công.",
      pointsAdded: points,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi hoàn thành đơn hàng:", error);
    res
      .status(500)
      .json({ error: `Lỗi khi hoàn thành đơn hàng: ${error.message}` });
  }
};
