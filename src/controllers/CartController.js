import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Cart, Customers, Products } = models;

export const getCart = async (req, res) => {
  try {
    const customerId = req.customer.CustomerID;

    const cart = await Cart.findAll({
      where: { CustomerID: customerId },
      include: [
        {
          model: Customers,
          as: "Customer",
          attributes: ["CustomerID", "FullName"],
        },
        {
          model: Products,
          as: "Product",
          attributes: ["ProductID", "ProductName", "Price", "ImageURL"],
        },
      ],
    });

    res.status(200).json({ message: "Cart retrieved successfully", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const customerId = req.customer.CustomerID;
    const { ProductID, Quantity } = req.body;

    if (!ProductID || !Quantity || Quantity <= 0) {
      return res
        .status(400)
        .json({ error: "ProductID and valid Quantity are required" });
    }

    const product = await Products.findByPk(ProductID);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.StockQuantity < Quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const existingCartItem = await Cart.findOne({
      where: { CustomerID: customerId, ProductID },
    });

    if (existingCartItem) {
      await existingCartItem.update({
        Quantity: existingCartItem.Quantity + Quantity,
      });
    } else {
      await Cart.create({
        CustomerID: customerId,
        ProductID,
        Quantity,
      });
    }

    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const customerId = req.customer.CustomerID;
    const { ProductID, Quantity } = req.body;

    if (!ProductID || !Quantity || Quantity <= 0) {
      return res
        .status(400)
        .json({ error: "ProductID and valid Quantity are required" });
    }

    const cartItem = await Cart.findOne({
      where: { CustomerID: customerId, ProductID },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const product = await Products.findByPk(ProductID);
    if (product.StockQuantity < Quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    await cartItem.update({ Quantity });

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const customerId = req.customer.CustomerID;
    const { ProductID } = req.body;

    if (!ProductID) {
      return res.status(400).json({ error: "ProductID is required" });
    }

    const cartItem = await Cart.findOne({
      where: { CustomerID: customerId, ProductID },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await cartItem.destroy();

    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
