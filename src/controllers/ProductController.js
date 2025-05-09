import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Products, Categories, Notification } = models;

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
      Ingredients,
    } = req.body;

    // Kiểm tra danh mục
    if (
      !CategoryIDs ||
      !Array.isArray(CategoryIDs) ||
      CategoryIDs.length === 0
    ) {
      await transaction.rollback();
      return res.status(400).json({ error: "Cần ít nhất một CategoryID." });
    }

    const categories = await Categories.findAll({
      where: { CategoryID: CategoryIDs },
      transaction,
    });
    if (categories.length !== CategoryIDs.length) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Không tìm thấy một hoặc nhiều danh mục." });
    }

    // Kiểm tra giá và số lượng
    if (Price <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Giá phải lớn hơn 0." });
    }
    if (StockQuantity < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Số lượng tồn kho không được âm." });
    }

    // Tạo sản phẩm
    const product = await Products.create(
      {
        ProductName,
        Description,
        Price,
        StockQuantity,
        Ingredients,
        ImageURL,
      },
      { transaction }
    );

    // Gán danh mục cho sản phẩm
    await product.addCategories(categories, { transaction });

    // Tạo thông báo cho tất cả người dùng
    await Notification.create(
      {
        UserID: null, // null means for all users
        Title: `Sản phẩm mới: ${ProductName}`,
        Message: `Sản phẩm ${ProductName} vừa được ra mắt! Hãy khám phá ngay tại Cholimex.`,
        IsRead: false,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: "Đã thêm sản phẩm thành công.", product });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi thêm sản phẩm: ${error.message}` });
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
        "Ingredients",
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách sản phẩm: ${error.message}` });
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
        "Ingredients",
      ],
    });
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy chi tiết sản phẩm: ${error.message}` });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      CategoryIDs,
      ProductName,
      Description,
      Price,
      StockQuantity,
      ImageURL,
      Ingredients,
    } = req.body;

    const product = await Products.findByPk(id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
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
          .json({ error: "Không tìm thấy một hoặc nhiều danh mục." });
      }
      await product.setCategories(categories, { transaction });
    }

    // Kiểm tra giá và số lượng (nếu có)
    if (Price !== undefined && Price <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Giá phải lớn hơn 0." });
    }
    if (StockQuantity !== undefined && StockQuantity < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Số lượng tồn kho không được âm." });
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
        Ingredients:
          Ingredients !== undefined ? Ingredients : product.Ingredients,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Đã cập nhật sản phẩm thành công." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi cập nhật sản phẩm: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    }

    await product.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa sản phẩm thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi xóa sản phẩm: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    }

    if (
      !CategoryIDs ||
      !Array.isArray(CategoryIDs) ||
      CategoryIDs.length === 0
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "CategoryIDs phải là một mảng không rỗng." });
    }

    const categories = await Categories.findAll({
      where: { CategoryID: CategoryIDs },
      transaction,
    });
    if (categories.length !== CategoryIDs.length) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Không tìm thấy một hoặc nhiều danh mục." });
    }

    await product.addCategories(categories, { transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Đã thêm danh mục vào sản phẩm thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi thêm danh mục: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    }

    if (
      !CategoryIDs ||
      !Array.isArray(CategoryIDs) ||
      CategoryIDs.length === 0
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "CategoryIDs phải là một mảng không rỗng." });
    }

    const categories = await Categories.findAll({
      where: { CategoryID: CategoryIDs },
      transaction,
    });
    if (categories.length !== CategoryIDs.length) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Không tìm thấy một hoặc nhiều danh mục." });
    }

    await product.removeCategories(categories, { transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Đã xóa danh mục khỏi sản phẩm thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi xóa danh mục: ${error.message}` });
  }
};
