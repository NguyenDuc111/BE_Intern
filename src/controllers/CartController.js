import sequelize from '../config/db.js';
    import initModels from '../models/init-models.js';

    const models = initModels(sequelize);
    const { Cart, Products, Customers } = models;

    export const createCartItem = async (req, res) => {
      try {
        const { CustomerID, ProductID, Quantity } = req.body;
        const cartItem = await Cart.create({ CustomerID, ProductID, Quantity });
        res.status(201).json(cartItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    export const getCartItems = async (req, res) => {
      try {
        const cartItems = await Cart.findAll({
          where: { CustomerID: req.params.CustomerID },
          include: [{ model: Products, as: 'Product' }],
        });
        res.json(cartItems);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };