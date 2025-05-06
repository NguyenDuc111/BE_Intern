import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";

const models = initModels(sequelize);
const { Vouchers, UserVouchers, LoyaltyPoints } = models;

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
    const vouchers = await Vouchers.findAll();
    return res.status(200).json({
      message: "Danh sách voucher có sẵn",
      vouchers: vouchers.map((v) => ({
        id: v.VoucherID,
        name: v.Name,
        discount: v.DiscountValue,
        pointsRequired: v.PointsRequired,
        usageLimit: v.UsageLimit,
        expiryDays: v.ExpiryDays,
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
  const { userId } = req.user;

  console.log(`redeemVoucher called: userId=${userId}, voucherId=${voucherId}`);

  // Kiểm tra userId
  if (!userId) {
    console.error("Không tìm thấy UserID trong req.user");
    return res
      .status(401)
      .json({ message: "Không tìm thấy UserID. Vui lòng đăng nhập lại." });
  }

  // Kiểm tra voucherId
  if (!voucherId || !Number.isInteger(Number(voucherId))) {
    console.error("voucherId không hợp lệ:", voucherId);
    return res
      .status(400)
      .json({ message: "Yêu cầu cung cấp Voucher ID hợp lệ." });
  }

  try {
    // Kiểm tra voucher
    const voucher = await Vouchers.findByPk(voucherId);
    if (!voucher) {
      console.error(`Voucher không tồn tại: voucherId=${voucherId}`);
      return res.status(404).json({ message: "Voucher không tồn tại." });
    }

    // Kiểm tra trùng lặp
    const existingUserVoucher = await UserVouchers.findOne({
      where: {
        UserID: userId,
        VoucherID: voucherId,
        Status: { [Op.in]: ["active", "used"] },
      },
    });
    if (existingUserVoucher) {
      console.error(
        `Người dùng đã đổi voucher này: userId=${userId}, voucherId=${voucherId}`
      );
      return res
        .status(400)
        .json({ message: "Bạn đã đổi voucher này trước đó." });
    }

    // Tính tổng điểm tích lũy
    const totalPoints =
      (await LoyaltyPoints.sum("Points", {
        where: { UserID: userId },
      })) || 0;

    // Kiểm tra đủ điểm
    if (totalPoints < voucher.PointsRequired) {
      console.error(
        `Không đủ điểm: userId=${userId}, totalPoints=${totalPoints}, required=${voucher.PointsRequired}`
      );
      return res.status(400).json({
        message: `Không đủ điểm. Cần ${voucher.PointsRequired} điểm, bạn chỉ có ${totalPoints}.`,
      });
    }

    // Tạo mã ngẫu nhiên duy nhất
    const randomCode = await generateRandomCode();

    // Tính ngày hết hạn
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + voucher.ExpiryDays);

    // Thực hiện giao dịch để đảm bảo tính toàn vẹn dữ liệu
    await sequelize.transaction(async (t) => {
      // Tạo bản ghi UserVouchers
      await UserVouchers.create(
        {
          UserID: userId,
          VoucherID: voucherId,
          Code: randomCode,
          ExpiryDate: expiryDate,
          Status: "active",
          UsageCount: 0,
        },
        { transaction: t }
      );

      // Trừ điểm
      await LoyaltyPoints.create(
        {
          UserID: userId,
          Points: -voucher.PointsRequired,
          Description: `Đổi voucher ${voucher.Name}`,
          CreatedAt: new Date(),
        },
        { transaction: t }
      );
    });

    console.log(
      `Đổi voucher thành công: userId=${userId}, voucherId=${voucherId}, code=${randomCode}`
    );
    return res.status(200).json({
      message: `Đổi voucher thành công! Mã: ${randomCode} (hết hạn vào ${expiryDate.toLocaleDateString(
        "vi-VN"
      )}).`,
      code: randomCode,
      pointsRemaining: totalPoints - voucher.PointsRequired,
    });
  } catch (error) {
    console.error(
      `Lỗi trong redeemVoucher: userId=${userId}, voucherId=${voucherId}, error=${error.message}`,
      error.stack
    );
    return res.status(500).json({ message: `Lỗi server: ${error.message}` });
  }
};

// Áp dụng voucher trong giỏ hàng
export const applyVoucher = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Yêu cầu không có body." });
  }

  const { voucherCode } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Không tìm thấy UserID. Vui lòng đăng nhập lại." });
  }

  if (!voucherCode) {
    return res.status(400).json({ message: "Yêu cầu cung cấp mã voucher." });
  }

  try {
    const userVoucher = await UserVouchers.findOne({
      where: { UserID: userId, Code: voucherCode },
      include: [{ model: Vouchers, as: "Voucher" }],
    });

    if (!userVoucher) {
      return res
        .status(404)
        .json({ message: "Mã voucher không hợp lệ hoặc không thuộc về bạn." });
    }

    // Kiểm tra trạng thái voucher
    if (userVoucher.Status !== "active") {
      return res.status(400).json({
        message: `Mã voucher đã ${
          userVoucher.Status === "used" ? "được sử dụng hết" : "hết hạn"
        }.`,
      });
    }

    // Kiểm tra ngày hết hạn
    const currentDate = new Date();
    if (new Date(userVoucher.ExpiryDate) < currentDate) {
      await userVoucher.update({ Status: "expired" });
      return res.status(400).json({ message: "Mã voucher đã hết hạn." });
    }

    // Kiểm tra giới hạn sử dụng
    if (userVoucher.UsageCount >= userVoucher.Voucher.UsageLimit) {
      await userVoucher.update({ Status: "used" });
      return res
        .status(400)
        .json({ message: "Mã voucher đã đạt giới hạn sử dụng." });
    }

    // Tăng số lần sử dụng
    await userVoucher.update({ UsageCount: userVoucher.UsageCount + 1 });
    if (userVoucher.UsageCount + 1 >= userVoucher.Voucher.UsageLimit) {
      await userVoucher.update({ Status: "used" });
    }

    return res.status(200).json({
      message: `Áp dụng voucher thành công! Giảm ${
        userVoucher.Voucher.DiscountValue
      }${userVoucher.Voucher.DiscountValue <= 100 ? "%" : " VND"}.`,
      discount: userVoucher.Voucher.DiscountValue,
      isPercentage: userVoucher.Voucher.DiscountValue <= 100,
    });
  } catch (error) {
    console.error("Lỗi trong applyVoucher:", error.message, error.stack);
    return res.status(500).json({ message: `Lỗi server: ${error.message}` });
  }
};
