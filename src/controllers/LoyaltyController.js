import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { LoyaltyPoints, Promotions, Users } = models;

// Lấy tổng điểm và lịch sử tích điểm của người dùng hiện tại
export const getLoyaltyPoints = async (req, res) => {
  try {
    const { UserID } = req.user;
    const points = await LoyaltyPoints.findAll({
      where: { UserID },
      attributes: ["PointID", "Points", "Description"],
      order: [[ "PointID","DESC"]],
    });
    const totalPoints = points.reduce((sum, point) => sum + point.Points, 0);
    res.status(200).json({ totalPoints, history: points });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy điểm tích lũy: ${error.message}` });
  }
};

// Đổi điểm lấy quà/voucher
export const redeemPoints = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { rewardType } = req.body;

    const points = await LoyaltyPoints.findAll({
      where: { UserID },
      transaction,
    });
    const totalPoints = points.reduce((sum, point) => sum + point.Points, 0);

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
      return res.status(400).json({ error: "Loại phần thưởng không hợp lệ." });
    }

    const { points: requiredPoints, description, action } = rewards[rewardType];

    if (totalPoints < requiredPoints) {
      await transaction.rollback();
      return res.status(400).json({ error: "Không đủ điểm để đổi." });
    }

    await LoyaltyPoints.create(
      {
        UserID,
        Points: -requiredPoints,
        Description: `Đổi ${description}`,
      },
      { transaction }
    );

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
          EndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        { transaction }
      );
      rewardResult = { voucher: promotion };
    } else if (action === "sendGift") {
      rewardResult = {
        message: "Quà sẽ được gửi đến địa chỉ của bạn trong 7 ngày.",
      };
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Đã đổi điểm thành công.", reward: rewardResult });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi đổi điểm: ${error.message}` });
  }
};

// Xem chi tiết điểm của một người dùng (admin)
export const getUserPointsByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    const points = await LoyaltyPoints.findAll({
      where: { UserID: userId },
      attributes: ["PointID", "Points", "Description"],
      order: [["PointID", "DESC"]],
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["UserID", "FullName", "Email"],
        },
      ],
    });

    const totalPoints = points.reduce((sum, point) => sum + point.Points, 0);

    res.status(200).json({
      user: { UserID: user.UserID, FullName: user.FullName, Email: user.Email },
      totalPoints,
      history: points,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy điểm của người dùng: ${error.message}` });
  }
};

// Sửa bản ghi điểm tích lũy (admin)
export const updateLoyaltyPoint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { Points, Description } = req.body;

    // Chuyển đổi id thành số nguyên
    const loyaltyPointId = parseInt(id, 10);
    if (isNaN(loyaltyPointId)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "ID bản ghi điểm phải là một số nguyên hợp lệ." });
    }

    // Tìm bản ghi
    const loyaltyPoint = await LoyaltyPoints.findByPk(loyaltyPointId, {
      transaction,
    });
    if (!loyaltyPoint) {
      await transaction.rollback();
      return res.status(404).json({
        error: `Không tìm thấy bản ghi điểm với ID ${loyaltyPointId}.`,
      });
    }

    // Kiểm tra Points
    if (Points === undefined || typeof Points !== "number" || Points === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Điểm phải là một số khác 0." });
    }

    // Cập nhật bản ghi
    await loyaltyPoint.update(
      { Points, Description: Description || loyaltyPoint.Description },
      { transaction }
    );

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Đã cập nhật bản ghi điểm thành công.", loyaltyPoint });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi cập nhật bản ghi điểm: ${error.message}` });
  }
};

// Xóa bản ghi điểm tích lũy (admin)
export const deleteLoyaltyPoint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const loyaltyPoint = await LoyaltyPoints.findByPk(id, { transaction });
    if (!loyaltyPoint) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy bản ghi điểm." });
    }

    await loyaltyPoint.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa bản ghi điểm thành công." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi xóa bản ghi điểm: ${error.message}` });
  }
};
