import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Products, Categories, Notifications } = models;

// Thêm sản phẩm mới
export const addProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      CategoryID,
      ProductName,
      Description,
      Price,
      StockQuantity,
      ImageURL,
    } = req.body;

    // Kiểm tra danh mục
    const category = await Categories.findByPk(CategoryID, { transaction });
    if (!category) {
      await transaction.rollback();
      return res.status(404).json({ error: "Category not found." });
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
        CategoryID,
        ProductName,
        Description,
        Price,
        StockQuantity,
        ImageURL,
      },
      { transaction }
    );

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
          as: "Category",
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
          as: "Category",
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
      CategoryID,
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
    if (CategoryID) {
      const category = await Categories.findByPk(CategoryID, { transaction });
      if (!category) {
        await transaction.rollback();
        return res.status(404).json({ error: "Category not found." });
      }
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
        CategoryID: CategoryID || product.CategoryID,
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
