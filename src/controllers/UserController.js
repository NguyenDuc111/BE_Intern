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

    export const updateProfile = async (req, res) => {
      try {
        const customerId = req.customer.CustomerID;
        const { FullName, Phone, Address } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!FullName && !Phone && !Address) {
          return res.status(400).json({ error: 'At least one field (FullName, Phone, Address) must be provided' });
        }

        // Tìm khách hàng
        const customer = await Customers.findByPk(customerId);
        if (!customer) {
          return res.status(404).json({ error: 'Customer not found' });
        }

        // Cập nhật các trường được cung cấp
        const updatedData = {};
        if (FullName) updatedData.FullName = FullName;
        if (Phone) updatedData.Phone = Phone;
        if (Address) updatedData.Address = Address;

        await customer.update(updatedData);

        // Lấy thông tin mới
        const updatedCustomer = await Customers.findByPk(customerId, {
          attributes: ['CustomerID', 'FullName', 'Email', 'Phone', 'Address'],
        });

        res.status(200).json({ message: 'Profile updated successfully', customer: updatedCustomer });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };