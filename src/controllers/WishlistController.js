import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Wishlists, Products } = models;

// Thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { ProductID } = req.body;
    const { UserID } = req.user;

    // Kiểm tra sản phẩm
    const product = await Products.findByPk(ProductID, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    }

    // Kiểm tra sản phẩm đã có trong danh sách
    const existingWishlist = await Wishlists.findOne({
      where: { UserID, ProductID },
      transaction,
    });
    if (existingWishlist) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Sản phẩm đã có trong danh sách yêu thích." });
    }

    // Thêm vào danh sách
    const wishlist = await Wishlists.create(
      { UserID, ProductID },
      { transaction }
    );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Đã thêm sản phẩm vào danh sách yêu thích.", wishlist });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({
        error: `Lỗi khi thêm vào danh sách yêu thích: ${error.message}`,
      });
  }
};

// Lấy danh sách yêu thích
export const getWishlist = async (req, res) => {
  try {
    const { UserID } = req.user;

    const wishlists = await Wishlists.findAll({
      where: { UserID },
      include: [
        {
          model: Products,
          as: "Product",
          attributes: ["ProductID", "ProductName", "Price", "ImageURL"],
        },
      ],
      attributes: ["WishlistID"],
    });

    res.status(200).json(wishlists);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách yêu thích: ${error.message}` });
  }
};

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { UserID } = req.user;

    const wishlist = await Wishlists.findByPk(id, { transaction });
    if (!wishlist) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Không tìm thấy sản phẩm trong danh sách yêu thích." });
    }

    if (wishlist.UserID !== UserID) {
      await transaction.rollback();
      return res.status(403).json({ error: "Không có quyền truy cập." });
    }

    await wishlist.destroy({ transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Đã xóa sản phẩm khỏi danh sách yêu thích." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({
        error: `Lỗi khi xóa khỏi danh sách yêu thích: ${error.message}`,
      });
  }
};
