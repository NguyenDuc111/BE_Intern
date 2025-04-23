import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Promotions, Products } = models;

// Tạo khuyến mãi mới
export const createPromotion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { ProductID, DiscountPercentage, StartDate, EndDate } = req.body;

    // Kiểm tra sản phẩm
    const product = await Products.findByPk(ProductID, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    // Kiểm tra DiscountPercentage
    if (DiscountPercentage < 0 || DiscountPercentage > 100) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Discount percentage must be between 0 and 100." });
    }

    // Kiểm tra ngày
    const start = new Date(StartDate);
    const end = new Date(EndDate);
    if (end < start) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "End date must be after start date." });
    }

    // Tạo khuyến mãi
    const promotion = await Promotions.create(
      {
        ProductID,
        DiscountPercentage,
        StartDate,
        EndDate,
      },
      { transaction }
    );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Promotion created successfully.", promotion });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Create promotion error: ${error.message}` });
  }
};

// Lấy tất cả khuyến mãi
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotions.findAll({
      include: [
        { model: Products, attributes: ["ProductID", "ProductName", "Price"] },
      ],
    });

    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ error: `Get promotions error: ${error.message}` });
  }
};

// Lấy khuyến mãi theo ID
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotions.findByPk(id, {
      include: [
        { model: Products, attributes: ["ProductID", "ProductName", "Price"] },
      ],
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found." });
    }

    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ error: `Get promotion error: ${error.message}` });
  }
};

// Cập nhật khuyến mãi
export const updatePromotion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { ProductID, DiscountPercentage, StartDate, EndDate } = req.body;

    const promotion = await Promotions.findByPk(id, { transaction });
    if (!promotion) {
      await transaction.rollback();
      return res.status(404).json({ error: "Promotion not found." });
    }

    // Kiểm tra sản phẩm nếu ProductID thay đổi
    if (ProductID && ProductID !== promotion.ProductID) {
      const product = await Products.findByPk(ProductID, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: "Product not found." });
      }
    }

    // Kiểm tra DiscountPercentage
    if (
      DiscountPercentage !== undefined &&
      (DiscountPercentage < 0 || DiscountPercentage > 100)
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Discount percentage must be between 0 and 100." });
    }

    // Kiểm tra ngày
    const start = StartDate
      ? new Date(StartDate)
      : new Date(promotion.StartDate);
    const end = EndDate ? new Date(EndDate) : new Date(promotion.EndDate);
    if (end < start) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "End date must be after start date." });
    }

    // Cập nhật khuyến mãi
    await promotion.update(
      {
        ProductID: ProductID || promotion.ProductID,
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
    res
      .status(200)
      .json({ message: "Promotion updated successfully.", promotion });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Update promotion error: ${error.message}` });
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
      return res.status(404).json({ error: "Promotion not found." });
    }

    await promotion.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Promotion deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Delete promotion error: ${error.message}` });
  }
};
