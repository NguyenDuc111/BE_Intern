import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Products, Categories, Notifications } = models;

// Thêm sản phẩm mới
export const addProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      CategoryIDs, 
      ProductName,
      Description,
      Price,
      StockQuantity,
      ImageURL,
    } = req.body;

    // Kiểm tra danh mục
    if (
      !CategoryIDs ||
      !Array.isArray(CategoryIDs) ||
      CategoryIDs.length === 0
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "At least one CategoryID is required." });
    }

    const categories = await Categories.findAll({
      where: { CategoryID: CategoryIDs },
      transaction,
    });
    if (categories.length !== CategoryIDs.length) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "One or more categories not found." });
    }

    // Kiểm tra giá và số lượng
    if (Price <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Price must be greater than 0." });
    }
    if (StockQuantity < 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Stock quantity cannot be negative." });
    }

    // Tạo sản phẩm
    const product = await Products.create(
      {
        ProductName,
        Description,
        Price,
        StockQuantity,
        ImageURL,
      },
      { transaction }
    );

    // Gán danh mục cho sản phẩm
    await product.addCategories(categories, { transaction });

    // Tạo thông báo cho tất cả người dùng
    await Notifications.create(
      {
        UserID: null, // Thông báo chung
        Title: "Sản phẩm mới tại Cholimex!",
        Message: `Sản phẩm mới: ${ProductName} đã có mặt tại Cholimex!`,
        IsRead: false,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: "Product added successfully.", product });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Add product error: ${error.message}` });
  }
};

// Lấy danh sách sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    const products = await Products.findAll({
      include: [
        {
          model: Categories,
          as: "Categories", 
          through: { attributes: [] }, 
          attributes: ["CategoryID", "CategoryName"],
        },
      ],
      attributes: [
        "ProductID",
        "ProductName",
        "Description",
        "Price",
        "StockQuantity",
        "ImageURL",
        "CreatedAt",
        "UpdatedAt",
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: `Get products error: ${error.message}` });
  }
};

// Lấy chi tiết sản phẩm
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByPk(id, {
      include: [
        {
          model: Categories,
          as: "Categories", // Thay "Category" bằng "Categories"
          through: { attributes: [] },
          attributes: ["CategoryID", "CategoryName"],
        },
      ],
      attributes: [
        "ProductID",
        "ProductName",
        "Description",
        "Price",
        "StockQuantity",
        "ImageURL",
        "CreatedAt",
        "UpdatedAt",
      ],
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: `Get product error: ${error.message}` });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      CategoryIDs, // Thay CategoryID bằng CategoryIDs
      ProductName,
      Description,
      Price,
      StockQuantity,
      ImageURL,
    } = req.body;

    const product = await Products.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    // Kiểm tra danh mục (nếu có)
    if (CategoryIDs && Array.isArray(CategoryIDs)) {
      const categories = await Categories.findAll({
        where: { CategoryID: CategoryIDs },
        transaction,
      });
      if (categories.length !== CategoryIDs.length) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ error: "One or more categories not found." });
      }
      await product.setCategories(categories, { transaction });
    }

    // Kiểm tra giá và số lượng (nếu có)
    if (Price !== undefined && Price <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Price must be greater than 0." });
    }
    if (StockQuantity !== undefined && StockQuantity < 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Stock quantity cannot be negative." });
    }

    // Cập nhật sản phẩm
    await product.update(
      {
        ProductName: ProductName || product.ProductName,
        Description:
          Description !== undefined ? Description : product.Description,
        Price: Price !== undefined ? Price : product.Price,
        StockQuantity:
          StockQuantity !== undefined ? StockQuantity : product.StockQuantity,
        ImageURL: ImageURL !== undefined ? ImageURL : product.ImageURL,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Product updated successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Update product error: ${error.message}` });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const product = await Products.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    await product.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Delete product error: ${error.message}` });
  }
};

// Thêm danh mục vào sản phẩm
export const addCategoriesToProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { CategoryIDs } = req.body;

    const product = await Products.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    if (
      !CategoryIDs ||
      !Array.isArray(CategoryIDs) ||
      CategoryIDs.length === 0
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "CategoryIDs must be a non-empty array." });
    }

    const categories = await Categories.findAll({
      where: { CategoryID: CategoryIDs },
      transaction,
    });
    if (categories.length !== CategoryIDs.length) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "One or more categories not found." });
    }

    await product.addCategories(categories, { transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Categories added to product successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Add categories error: ${error.message}` });
  }
};

// Xóa danh mục khỏi sản phẩm
export const removeCategoriesFromProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { CategoryIDs } = req.body;

    const product = await Products.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    if (
      !CategoryIDs ||
      !Array.isArray(CategoryIDs) ||
      CategoryIDs.length === 0
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "CategoryIDs must be a non-empty array." });
    }

    const categories = await Categories.findAll({
      where: { CategoryID: CategoryIDs },
      transaction,
    });
    if (categories.length !== CategoryIDs.length) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "One or more categories not found." });
    }

    await product.removeCategories(categories, { transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Categories removed from product successfully." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Remove categories error: ${error.message}` });
  }
};
