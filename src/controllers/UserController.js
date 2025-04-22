import sequelize from '../config/db.js';
    import initModels from '../models/init-models.js';

    const models = initModels(sequelize);
    const { Customers } = models;

    export const getProfile = async (req, res) => {
      try {
        const customerId = req.customer.CustomerID;

        const customer = await Customers.findByPk(customerId, {
          attributes: ['CustomerID', 'FullName', 'Email', 'Phone', 'Address'],
        });

        if (!customer) {
          return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Profile retrieved successfully', customer });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };