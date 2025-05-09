import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";

const models = initModels(sequelize);
const { Vouchers, UserVouchers, LoyaltyPoints, UserRedemptionLimits } = models;

const generateRandomCode = async (attempts = 0) => {
  if (attempts >= 10) {
    throw new Error("Không thể tạo mã duy nhất sau 10 lần thử.");
  }
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const existingCode = await UserVouchers.findOne({ where: { Code: code } });
  if (existingCode) {
    return generateRandomCode(attempts + 1);
  }
  return code;
};

export const getAvailableVouchers = async (req, res) => {
  try {
    const { UserID } = req.user;
    if (!UserID) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy UserID. Vui lòng đăng nhập lại." });
    }

    const vouchers = await Vouchers.findAll();
    const userRedemptions = await UserRedemptionLimits.findAll({
      where: { UserID },
      attributes: ["VoucherID", "RedemptionCount"],
    });
    const redemptionCounts = userRedemptions.reduce((acc, ur) => {
      acc[ur.VoucherID] = ur.RedemptionCount;
      return acc;
    }, {});

    const mappedVouchers = vouchers.map((v) => {
      
      return {
        id: v.VoucherID,
        name: v.Name,
        discount: v.DiscountValue,
        pointsRequired: v.PointsRequired,
        usageLimit: v.UsageLimit,
        redemptionLimit: v.RedemptionLimit,
        expiryDays: v.ExpiryDays,
        minOrderValue: v.MinOrderValue,
        redemptionsRemaining:
          v.RedemptionLimit - (redemptionCounts[v.VoucherID] || 0),
      };
    });

    return res.status(200).json({
      message: "Danh sách voucher có sẵn",
      vouchers: mappedVouchers,
    });
  } catch (error) {
    console.error(
      "Lỗi trong getAvailableVouchers:",
      error.message,
      error.stack
    );
    return res.status(500).json({ message: "Lỗi server." });
  }
};

export const redeemVoucher = async (req, res) => {
  const { voucherId } = req.body;
  const { UserID } = req.user;

  if (!UserID) {
    return res
      .status(401)
      .json({ message: "Không tìm thấy UserID. Vui lòng đăng nhập lại." });
  }

  if (!voucherId || !Number.isInteger(Number(voucherId))) {
    return res
      .status(400)
      .json({ message: "Yêu cầu cung cấp Voucher ID hợp lệ." });
  }

  try {
    return await sequelize.transaction(async (t) => {
      const voucher = await Vouchers.findByPk(voucherId, { transaction: t });
      if (!voucher) {
        return res.status(404).json({ message: "Voucher không tồn tại." });
      }

      let userRedemption = await UserRedemptionLimits.findOne({
        where: { UserID, VoucherID: voucherId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!userRedemption) {
        userRedemption = await UserRedemptionLimits.create(
          { UserID, VoucherID: voucherId, RedemptionCount: 0 },
          { transaction: t }
        );
      }

      if (userRedemption.RedemptionCount >= voucher.RedemptionLimit) {
        return res.status(400).json({
          message: `Bạn đã đổi voucher này tối đa ${voucher.RedemptionLimit} lần.`,
        });
      }

      const totalPoints =
        (await LoyaltyPoints.sum("Points", {
          where: { UserID },
          transaction: t,
        })) || 0;
      if (totalPoints < voucher.PointsRequired) {
        return res.status(400).json({
          message: `Không đủ điểm. Cần ${voucher.PointsRequired} điểm, bạn chỉ có ${totalPoints}.`,
        });
      }

      const randomCode = await generateRandomCode();
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await UserVouchers.create(
        {
          UserID: UserID,
          VoucherID: voucherId,
          Code: randomCode,
          ExpiryDate: expiryDate,
          Status: "active",
          UsageCount: 0,
        },
        { transaction: t }
      );

      await LoyaltyPoints.create(
        {
          UserID: UserID,
          Points: -voucher.PointsRequired,
          Description: `Đổi voucher ${voucher.Name}`,
          CreatedAt: new Date(),
        },
        { transaction: t }
      );

      await userRedemption.update(
        { RedemptionCount: userRedemption.RedemptionCount + 1 },
        { transaction: t }
      );

      return res.status(200).json({
        message: `Đổi voucher thành công! Mã: ${randomCode} (hết hạn vào ${expiryDate.toLocaleDateString(
          "vi-VN"
        )}).`,
        code: randomCode,
        pointsRemaining: totalPoints - voucher.PointsRequired,
        redemptionsRemaining:
          voucher.RedemptionLimit - (userRedemption.RedemptionCount + 1),
      });
    });
  } catch (error) {
    console.error("Lỗi trong redeemVoucher:", error.message, error.stack);
    return res.status(500).json({ message: `Lỗi server: ${error.message}` });
  }
};

export const applyVoucher = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Yêu cầu không có body." });
  }

  const { voucherCode, totalAmount, pointsUsed } = req.body;
  const { UserID } = req.user;

  if (!UserID) {
    return res
      .status(401)
      .json({ message: "Không tìm thấy UserID. Vui lòng đăng nhập lại." });
  }

  if (!voucherCode) {
    return res.status(400).json({ message: "Yêu cầu cung cấp mã voucher." });
  }

  if (!totalAmount || typeof totalAmount !== "number" || totalAmount <= 0) {
    return res
      .status(400)
      .json({ message: "Yêu cầu cung cấp tổng giá đơn hàng hợp lệ." });
  }

  try {
    const userVoucher = await UserVouchers.findOne({
      where: { UserID: UserID, Code: voucherCode },
      include: [{ model: Vouchers, as: "Voucher" }],
    });

    if (!userVoucher) {
      return res
        .status(404)
        .json({ message: "Mã voucher không hợp lệ hoặc không thuộc về bạn." });
    }

    if (userVoucher.Status !== "active") {
      return res.status(400).json({
        message: `Mã voucher đã ${
          userVoucher.Status === "used" ? "được sử dụng" : "hết hạn"
        }.`,
      });
    }

    const currentDate = new Date();
    if (new Date(userVoucher.ExpiryDate) < currentDate) {
      await userVoucher.update({ Status: "expired" });
      return res.status(400).json({ message: "Mã voucher đã hết hạn." });
    }

    if (userVoucher.UsageCount >= 1) {
      await userVoucher.update({ Status: "used" });
      return res.status(400).json({ message: "Mã voucher đã được sử dụng." });
    }

    if (userVoucher.Voucher.MinOrderValue > totalAmount) {
      return res.status(400).json({
        message: `Đơn hàng cần tối thiểu ${userVoucher.Voucher.MinOrderValue.toLocaleString()}₫ để sử dụng voucher này.`,
      });
    }

    let discountFromVoucher = 0;
    if (userVoucher.Voucher.DiscountValue <= 100) {
      discountFromVoucher =
        (totalAmount * userVoucher.Voucher.DiscountValue) / 100;
    } else {
      discountFromVoucher = userVoucher.Voucher.DiscountValue;
    }

    const discountFromPoints = (pointsUsed || 0) * 1000;
    const finalAmount = Math.max(
      0,
      totalAmount - discountFromVoucher - discountFromPoints
    );

    if (finalAmount < 20000) {
      return res.status(400).json({
        message: `Tổng giá đơn hàng sau khi áp dụng voucher và điểm tích lũy phải tối thiểu 20,000₫ (hiện tại: ${finalAmount.toLocaleString()}₫).`,
      });
    }

    return res.status(200).json({
      message: `Mã voucher hợp lệ! Giảm ${userVoucher.Voucher.DiscountValue}${
        userVoucher.Voucher.DiscountValue <= 100 ? "%" : " VND"
      }.`,
      discount: userVoucher.Voucher.DiscountValue,
      isPercentage: userVoucher.Voucher.DiscountValue <= 100,
      finalAmount: finalAmount,
    });
  } catch (error) {
    console.error("Lỗi trong applyVoucher:", error.message, error.stack);
    return res.status(500).json({ message: `Lỗi server: ${error.message}` });
  }
};

export const getRedeemedVouchers = async (req, res) => {
  try {
    const { UserID } = req.user;

    const redeemedVouchers = await UserVouchers.findAll({
      where: { UserID },
      include: [
        {
          model: Vouchers,
          as: "Voucher",
          attributes: [
            "VoucherID",
            "Name",
            "DiscountValue",
            "PointsRequired",
            "MinOrderValue",
          ],
        },
      ],
    });

    const currentDate = new Date();
    const vouchers = redeemedVouchers.map((uv) => {
      let status = uv.Status;
      if (status === "active" && new Date(uv.ExpiryDate) < currentDate) {
        uv.update({ Status: "expired" });
        status = "expired";
      } else if (status === "active" && uv.UsageCount >= 1) {
        uv.update({ Status: "used" });
        status = "used";
      }

      return {
        voucherId: uv.VoucherID,
        voucherCode: uv.Code,
        name: uv.Voucher.Name,
        discount: uv.Voucher.DiscountValue,
        isPercentage: uv.Voucher.DiscountValue <= 100,
        expiryDate: uv.ExpiryDate.toISOString(),
        pointsRequired: uv.Voucher.PointsRequired,
        minOrderValue: uv.Voucher.MinOrderValue,
        status: status,
      };
    });

    res.status(200).json({ vouchers });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Lỗi khi lấy voucher đã đổi: ${error.message}` });
  }
};

// Hàm thêm voucher mới
export const addVoucher = async (req, res) => {
  try {
    const {
      Name,
      DiscountValue,
      PointsRequired,
      UsageLimit,
      RedemptionLimit,
      ExpiryDays,
      MinOrderValue,
    } = req.body;

    if (
      !Name ||
      DiscountValue == null ||
      PointsRequired == null ||
      UsageLimit == null ||
      RedemptionLimit == null ||
      ExpiryDays == null ||
      MinOrderValue == null
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin voucher." });
    }

    const newVoucher = await Vouchers.create({
      Name,
      DiscountValue,
      PointsRequired,
      UsageLimit,
      RedemptionLimit,
      ExpiryDays,
      MinOrderValue,
    });

    return res
      .status(201)
      .json({ message: "Thêm voucher thành công.", voucher: newVoucher });
  } catch (error) {
    console.error("Lỗi trong addVoucher:", error.message, error.stack);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

// Hàm sửa voucher
export const editVoucher = async (req, res) => {
  try {
    const { VoucherID } = req.params;
    const updates = req.body;

    if (!VoucherID) {
      return res.status(400).json({ message: "Vui lòng cung cấp VoucherID." });
    }

    const voucher = await Vouchers.findByPk(VoucherID);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại." });
    }

    await voucher.update(updates);

    return res
      .status(200)
      .json({ message: "Cập nhật voucher thành công.", voucher });
  } catch (error) {
    console.error("Lỗi trong editVoucher:", error.message, error.stack);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

// Hàm xóa voucher
export const deleteVoucher = async (req, res) => {
  try {
    const { VoucherID } = req.params;

    if (!VoucherID) {
      return res.status(400).json({ message: "Vui lòng cung cấp VoucherID." });
    }

    const voucher = await Vouchers.findByPk(VoucherID);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại." });
    }

    await voucher.destroy();

    return res.status(200).json({ message: "Xóa voucher thành công." });
  } catch (error) {
    console.error("Lỗi trong deleteVoucher:", error.message, error.stack);
    return res.status(500).json({ message: "Lỗi server." });
  }
};
