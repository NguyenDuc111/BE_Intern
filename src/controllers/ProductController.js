import sequelize from '../config/db.js';
    import initModels from '../models/init-models.js';

    const models = initModels(sequelize);
    const { Products, Categories } = models;

    export const getAllProducts = async (req, res) => {
      try {
        const products = await Products.findAll({
          include: [{ model: Categories, as: 'Category' }],
        });
        res.json(products);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    export const getProductById = async (req, res) => {
      try {
        const product = await Products.findByPk(req.params.id, {
          include: [{ model: Categories, as: 'Category' }],
        });
        if (product) {
          res.json(product);
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };