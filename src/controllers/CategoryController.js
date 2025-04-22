import sequelize from '../config/db.js';
    import initModels from '../models/init-models.js';

    const models = initModels(sequelize);
    const { Categories, Products } = models;

    export const getAllCategories = async (req, res) => {
      try {
        const categories = await Categories.findAll({
          attributes: ['CategoryID', 'CategoryName', 'Description', 'ImageURL'],
        });
        res.status(200).json({ message: 'Categories retrieved successfully', categories });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    export const getCategoryById = async (req, res) => {
      try {
        const { id } = req.params;
        const category = await Categories.findByPk(id, {
          attributes: ['CategoryID', 'CategoryName', 'Description', 'ImageURL'],
        });

        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category retrieved successfully', category });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    export const getProductsByCategory = async (req, res) => {
      try {
        const { id } = req.params;
        const category = await Categories.findByPk(id);

        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }

        const products = await Products.findAll({
          where: { CategoryID: id },
          attributes: ['ProductID', 'ProductName', 'Description', 'Price', 'StockQuantity', 'ImageURL'],
        });

        res.status(200).json({ message: 'Products retrieved successfully', products });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };