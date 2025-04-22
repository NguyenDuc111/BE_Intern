import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Products, Categories } = models;

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
      ],
    });
    res
      .status(200)
      .json({ message: "Products retrieved successfully", products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product retrieved successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
