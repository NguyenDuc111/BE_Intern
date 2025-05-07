import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Reviews, Users, Products, Roles } = models;

// Xem danh sách đánh giá
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findAll({
      include: [
        { model: Users, as: "User", attributes: ["UserID", "FullName"] },
        {
          model: Products,
          as: "Product",
          attributes: ["ProductID", "ProductName"],
        },
      ],
      attributes: ["ReviewID", "Rating", "Comment"],
    });
    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách đánh giá: ${error.message}` });
  }
};

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
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    }

    // Kiểm tra Rating hợp lệ
    if (!Number.isInteger(Rating) || Rating < 1 || Rating > 5) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Điểm đánh giá phải là số nguyên từ 1 đến 5." });
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
    res.status(201).json({ message: "Đã tạo đánh giá thành công.", review });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi tạo đánh giá: ${error.message}` });
  }
};

// Lấy tất cả đánh giá của một sản phẩm
export const getReviewsByProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Reviews.findAll({
      where: { ProductID: id },
      include: [
        { model: Users, as: "User", attributes: ["UserID", "FullName"] },
        {
          model: Products,
          as: "Product",
          attributes: ["ProductID", "ProductName"],
        },
      ],
    });

    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách đánh giá: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy đánh giá." });
    }

    // Chỉ cho phép người dùng cập nhật đánh giá của chính họ hoặc admin
    if (review.UserID !== UserID && req.user.RoleName !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Không có quyền truy cập." });
    }

    // Kiểm tra Rating hợp lệ
    if (Rating && (!Number.isInteger(Rating) || Rating < 1 || Rating > 5)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Điểm đánh giá phải là số nguyên từ 1 đến 5." });
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
    res
      .status(200)
      .json({ message: "Đã cập nhật đánh giá thành công.", review });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi cập nhật đánh giá: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy đánh giá." });
    }

    // Chỉ cho phép người dùng xóa đánh giá của chính họ hoặc admin
    if (review.UserID !== UserID && req.user.RoleName !== "admin") {
      await transaction.rollback();
      return res.status(403).json({ error: "Không có quyền truy cập." });
    }

    await review.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa đánh giá thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi xóa đánh giá: ${error.message}` });
  }
};
