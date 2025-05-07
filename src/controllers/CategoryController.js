import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Categories, Products } = models;

// Lấy danh sách danh mục
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll({
      attributes: [
        "CategoryID",
        "CategoryName",
        "Description",
        "ImageURL",
        [
          sequelize.fn("COUNT", sequelize.col("Products.ProductID")),
          "productCount",
        ],
      ],
      include: [
        {
          model: Products,
          as: "Products",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["Categories.CategoryID"],
    });

    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Lỗi khi lấy danh sách danh mục: ${error.message}` });
  }
};

// Thêm danh mục mới
export const createCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { CategoryName, Description, ImageURL } = req.body;

    if (!CategoryName) {
      await transaction.rollback();
      return res.status(400).json({ error: "Tên danh mục là bắt buộc." });
    }

    const category = await Categories.create(
      { CategoryName, Description, ImageURL },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: "Đã tạo danh mục thành công.", category });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi tạo danh mục: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy danh mục." });
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
    res.status(200).json({ message: "Đã cập nhật danh mục thành công." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ error: `Lỗi khi cập nhật danh mục: ${error.message}` });
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
      return res.status(404).json({ error: "Không tìm thấy danh mục." });
    }

    await category.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Đã xóa danh mục thành công." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Lỗi khi xóa danh mục: ${error.message}` });
  }
};
