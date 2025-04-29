import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Promotions, Products, Users } = models;

// Xem danh sách khuyến mãi
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotions.findAll({
      include: [
        {
          model: Products,
          as: "Product",
          attributes: ["ProductID", "ProductName"],
          required: false,
        },
        {
          model: Users,
          as: "User",
          attributes: ["UserID", "FullName"],
          required: false,
        },
      ],
      attributes: [
        "PromotionID",
        "PromotionName",
        "Description",
        "DiscountPercentage",
        "DiscountValue",
        "StartDate",
        "EndDate",
        "CreatedAt",
        "UpdatedAt",
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
    const {
      UserID,
      ProductID,
      PromotionName,
      Description,
      DiscountPercentage,
      DiscountValue,
      StartDate,
      EndDate,
    } = req.body;

    // Kiểm tra UserID (nếu có)
    if (UserID) {
      const user = await Users.findByPk(UserID, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(400).json({ error: "UserID không hợp lệ." });
      }
    }

    // Kiểm tra ProductID (nếu có)
    if (ProductID) {
      const product = await Products.findByPk(ProductID, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({ error: "ProductID không hợp lệ." });
      }
    }

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
    if (DiscountValue && DiscountValue < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Giá trị giảm giá không được âm." });
    }
    if (new Date(StartDate) >= new Date(EndDate)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Ngày kết thúc phải sau ngày bắt đầu." });
    }

    const promotion = await Promotions.create(
      {
        UserID,
        ProductID,
        PromotionName,
        Description,
        DiscountPercentage,
        DiscountValue,
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
    const {
      UserID,
      ProductID,
      PromotionName,
      Description,
      DiscountPercentage,
      DiscountValue,
      StartDate,
      EndDate,
    } = req.body;

    const promotion = await Promotions.findByPk(id, { transaction });
    if (!promotion) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi." });
    }

    // Kiểm tra UserID (nếu có)
    if (UserID !== undefined) {
      if (UserID && !(await Users.findByPk(UserID, { transaction }))) {
        await transaction.rollback();
        return res.status(400).json({ error: "UserID không hợp lệ." });
      }
    }

    // Kiểm tra ProductID (nếu có)
    if (ProductID !== undefined) {
      if (ProductID && !(await Products.findByPk(ProductID, { transaction }))) {
        await transaction.rollback();
        return res.status(400).json({ error: "ProductID không hợp lệ." });
      }
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
    if (DiscountValue !== undefined && DiscountValue < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Giá trị giảm giá không được âm." });
    }
    if (StartDate && EndDate && new Date(StartDate) >= new Date(EndDate)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Ngày kết thúc phải sau ngày bắt đầu." });
    }

    await promotion.update(
      {
        UserID: UserID !== undefined ? UserID : promotion.UserID,
        ProductID: ProductID !== undefined ? ProductID : promotion.ProductID,
        PromotionName: PromotionName || promotion.PromotionName,
        Description: Description || promotion.Description,
        DiscountPercentage:
          DiscountPercentage !== undefined
            ? DiscountPercentage
            : promotion.DiscountPercentage,
        DiscountValue:
          DiscountValue !== undefined ? DiscountValue : promotion.DiscountValue,
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

    const promotion = await Promotions.findByPk(id, { transaction });
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
