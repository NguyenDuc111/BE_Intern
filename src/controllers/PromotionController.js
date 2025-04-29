import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Promotion } = models;

// Xem danh sách khuyến mãi
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll({
      attributes: [
        "PromotionID",
        "Code",
        "Description",
        "DiscountPercentage",
        "StartDate",
        "EndDate",
      ],
    });
    res.status(200).json(promotions);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách khuyến mãi: ${error.message}` });
  }
};

// Thêm khuyến mãi mới
export const createPromotion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { Code, Description, DiscountPercentage, StartDate, EndDate } =
      req.body;

    // Kiểm tra dữ liệu
    if (
      DiscountPercentage &&
      (DiscountPercentage < 0 || DiscountPercentage > 100)
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Tỷ lệ giảm giá phải nằm trong khoảng từ 0 đến 100." });
    }
    if (new Date(StartDate) >= new Date(EndDate)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Ngày kết thúc phải sau ngày bắt đầu." });
    }

    const promotion = await Promotion.create(
      {
        Code,
        Description,
        DiscountPercentage,
        StartDate,
        EndDate,
      },
      { transaction }
    );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Đã tạo khuyến mãi thành công.", promotion });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi tạo khuyến mãi: ${error.message}` });
  }
};

// Cập nhật khuyến mãi
export const updatePromotion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { Code, Description, DiscountPercentage, StartDate, EndDate } =
      req.body;

    const promotion = await Promotion.findByPk(id, { transaction });
    if (!promotion) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi." });
    }

    // Kiểm tra dữ liệu
    if (
      DiscountPercentage !== undefined &&
      (DiscountPercentage < 0 || DiscountPercentage > 100)
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Tỷ lệ giảm giá phải nằm trong khoảng từ 0 đến 100." });
    }
    if (StartDate && EndDate && new Date(StartDate) >= new Date(EndDate)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Ngày kết thúc phải sau ngày bắt đầu." });
    }

    await promotion.update(
      {
        Code: Code || promotion.Code,
        Description: Description || promotion.Description,
        DiscountPercentage:
          DiscountPercentage !== undefined
            ? DiscountPercentage
            : promotion.DiscountPercentage,
        StartDate: StartDate || promotion.StartDate,
        EndDate: EndDate || promotion.EndDate,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Đã cập nhật khuyến mãi thành công." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi cập nhật khuyến mãi: ${error.message}` });
  }
};

// Xóa khuyến mãi
export const deletePromotion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id, { transaction });
    if (!promotion) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi." });
    }

    await promotion.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa khuyến mãi thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi xóa khuyến mãi: ${error.message}` });
  }
};
