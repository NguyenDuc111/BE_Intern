import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Reviews, Users, Products, Roles } = models;

// Tạo đánh giá mới
export const createReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { ProductID, Rating, Comment } = req.body;
    const UserID = req.user.UserID;

    // Kiểm tra sản phẩm
    const product = await Products.findByPk(ProductID, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    // Kiểm tra Rating hợp lệ
    if (!Number.isInteger(Rating) || Rating < 1 || Rating > 5) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Rating must be an integer between 1 and 5." });
    }

    // Tạo đánh giá
    const review = await Reviews.create(
      {
        UserID,
        ProductID,
        Rating,
        Comment,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: "Review created successfully.", review });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Create review error: ${error.message}` });
  }
};

// Lấy tất cả đánh giá của một sản phẩm
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Reviews.findAll({
      where: { ProductID: productId },
      include: [
        { model: Users, attributes: ["UserID", "FullName"] },
        { model: Products, attributes: ["ProductID", "ProductName"] },
      ],
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: `Get reviews error: ${error.message}` });
  }
};

// Cập nhật đánh giá
export const updateReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { Rating, Comment } = req.body;
    const UserID = req.user.UserID;

    const review = await Reviews.findByPk(id, { transaction });
    if (!review) {
      await transaction.rollback();
      return res.status(404).json({ error: "Review not found." });
    }

    // Chỉ cho phép người dùng cập nhật đánh giá của chính họ hoặc admin
    if (review.UserID !== UserID && req.user.RoleName !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied." });
    }

    // Kiểm tra Rating hợp lệ
    if (Rating && (!Number.isInteger(Rating) || Rating < 1 || Rating > 5)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Rating must be an integer between 1 and 5." });
    }

    // Cập nhật đánh giá
    await review.update(
      {
        Rating: Rating || review.Rating,
        Comment: Comment || review.Comment,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Review updated successfully.", review });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Update review error: ${error.message}` });
  }
};

// Xóa đánh giá
export const deleteReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const UserID = req.user.UserID;

    const review = await Reviews.findByPk(id, { transaction });
    if (!review) {
      await transaction.rollback();
      return res.status(404).json({ error: "Review not found." });
    }

    // Chỉ cho phép người dùng xóa đánh giá của chính họ hoặc admin
    if (review.UserID !== UserID && req.user.RoleName !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied." });
    }

    await review.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Delete review error: ${error.message}` });
  }
};
