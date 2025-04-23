import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Categories, Products } = models;

// Xem danh sách danh mục
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll({
      include: [
        {
          model: Products,
          as: "Products",
          through: { attributes: [] },
          attributes: ["ProductID", "ProductName"],
        },
      ],
      attributes: [
        "CategoryID",
        "CategoryName",
        "Description",
        "ImageURL",
        "CreatedAt",
        "UpdatedAt",
      ],
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: `Get categories error: ${error.message}` });
  }
};

// Thêm danh mục mới
export const createCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { CategoryName, Description, ImageURL } = req.body;

    if (!CategoryName) {
      await transaction.rollback();
      return res.status(400).json({ error: "CategoryName is required." });
    }

    const category = await Categories.create(
      { CategoryName, Description, ImageURL },
      { transaction }
    );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Category created successfully.", category });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Create category error: ${error.message}` });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { CategoryName, Description, ImageURL } = req.body;

    const category = await Categories.findByPk(id, { transaction });
    if (!category) {
      await transaction.rollback();
      return res.status(404).json({ error: "Category not found." });
    }

    await category.update(
      {
        CategoryName: CategoryName || category.CategoryName,
        Description: Description || category.Description,
        ImageURL: ImageURL || category.ImageURL,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Category updated successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Update category error: ${error.message}` });
  }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const category = await Categories.findByPk(id, { transaction });
    if (!category) {
      await transaction.rollback();
      return res.status(404).json({ error: "Category not found." });
    }

    await category.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Delete category error: ${error.message}` });
  }
};
