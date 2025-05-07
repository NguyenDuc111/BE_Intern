import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";

const models = initModels(sequelize);
const { Vouchers, UserVouchers, LoyaltyPoints, UserRedemptionLimits } = models;

// Tạo mã ngẫu nhiên 6 ký tự chữ và số
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

// Lấy danh sách tất cả voucher có sẵn
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

    return res.status(200).json({
      message: "Danh sách voucher có sẵn",
      vouchers: vouchers.map((v) => ({
        id: v.VoucherID,
        name: v.Name,
        discount: v.DiscountValue,
        pointsRequired: v.PointsRequired,
        redemptionLimit: v.RedemptionLimit,
        expiryDays: v.ExpiryDays,
        redemptionsRemaining:
          v.RedemptionLimit - (redemptionCounts[v.VoucherID] || 0),
      })),
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

// Đổi điểm lấy voucher
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

      // Khóa hoặc tạo bản ghi UserRedemptionLimits
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
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Hết hạn sau 30 ngày

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

// Áp dụng voucher trong giỏ hàng (chỉ xác thực, mỗi Code dùng 1 lần)
export const applyVoucher = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Yêu cầu không có body." });
  }

  const { voucherCode } = req.body;
  const { UserID } = req.user;

  if (!UserID) {
    return res
      .status(401)
      .json({ message: "Không tìm thấy UserID. Vui lòng đăng nhập lại." });
  }

  if (!voucherCode) {
    return res.status(400).json({ message: "Yêu cầu cung cấp mã voucher." });
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

    return res.status(200).json({
      message: `Mã voucher hợp lệ! Giảm ${userVoucher.Voucher.DiscountValue}${
        userVoucher.Voucher.DiscountValue <= 100 ? "%" : " VND"
      }.`,
      discount: userVoucher.Voucher.DiscountValue,
      isPercentage: userVoucher.Voucher.DiscountValue <= 100,
    });
  } catch (error) {
    console.error("Lỗi trong applyVoucher:", error.message, error.stack);
    return res.status(500).json({ message: `Lỗi server: ${error.message}` });
  }
};

// Lấy tất cả voucher đã đổi (bao gồm active, used, expired)
export const getRedeemedVouchers = async (req, res) => {
  try {
    const { UserID } = req.user;

    const redeemedVouchers = await UserVouchers.findAll({
      where: { UserID },
      include: [
        {
          model: Vouchers,
          as: "Voucher",
          attributes: ["VoucherID", "Name", "DiscountValue", "PointsRequired"],
        },
      ],
    });

    const currentDate = new Date();
    const vouchers = redeemedVouchers.map((uv) => {
      // Kiểm tra và cập nhật trạng thái nếu cần
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
