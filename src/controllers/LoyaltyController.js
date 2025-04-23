import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { LoyaltyPoints, Promotions } = models;

// Lấy tổng điểm và lịch sử tích điểm
export const getLoyaltyPoints = async (req, res) => {
  try {
    const { UserID } = req.user;
    const points = await LoyaltyPoints.findAll({
      where: { UserID },
      attributes: ["LoyaltyID", "Points", "Description", "EarnedAt"],
      order: [["EarnedAt", "DESC"]],
    });
    const totalPoints = points.reduce((sum, point) => sum + point.Points, 0);
    res.status(200).json({ totalPoints, history: points });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Get loyalty points error: ${error.message}` });
  }
};

// Đổi điểm lấy quà/voucher
export const redeemPoints = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { rewardType } = req.body;

    // Tính tổng điểm hiện tại
    const points = await LoyaltyPoints.findAll({
      where: { UserID },
      transaction,
    });
    const totalPoints = points.reduce((sum, point) => sum + point.Points, 0);

    // Xác định yêu cầu điểm và phần thưởng
    const rewards = {
      voucher_50k: {
        points: 100,
        description: "Voucher giảm 50,000 VND",
        action: "createVoucher",
      },
      gift_250g: {
        points: 200,
        description: "Tương ớt Cholimex 250g",
        action: "sendGift",
      },
      voucher_200k: {
        points: 500,
        description: "Voucher giảm 200,000 VND",
        action: "createVoucher",
      },
    };

    if (!rewards[rewardType]) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid reward type." });
    }

    const { points: requiredPoints, description, action } = rewards[rewardType];

    if (totalPoints < requiredPoints) {
      await transaction.rollback();
      return res.status(400).json({ error: "Not enough points." });
    }

    // Trừ điểm
    await LoyaltyPoints.create(
      {
        UserID,
        Points: -requiredPoints,
        Description: `Đổi ${description}`,
      },
      { transaction }
    );

    // Xử lý phần thưởng
    let rewardResult;
    if (action === "createVoucher") {
      const discountValue = rewardType === "voucher_50k" ? 50000 : 200000;
      const promotion = await Promotions.create(
        {
          UserID,
          PromotionName: `Voucher từ điểm - ${description}`,
          Description: `Giảm ${discountValue} VND cho đơn hàng`,
          DiscountValue: discountValue,
          StartDate: new Date(),
          EndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Hết hạn sau 30 ngày
        },
        { transaction }
      );
      rewardResult = { voucher: promotion };
    } else if (action === "sendGift") {
      // Giả lập gửi quà (thực tế cần tích hợp với hệ thống kho)
      rewardResult = {
        message: "Quà sẽ được gửi đến địa chỉ của bạn trong 7 ngày.",
      };
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Points redeemed successfully.", reward: rewardResult });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Redeem points error: ${error.message}` });
  }
};
