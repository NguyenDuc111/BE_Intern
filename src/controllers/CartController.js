import sequelize from "../config/db.js";
import initModels from "../models/init-models.js";

const models = initModels(sequelize);
const { Cart, Products } = models;

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { ProductID, Quantity } = req.body;

    // Kiểm tra sản phẩm
    const product = await Products.findByPk(ProductID, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    // Kiểm tra số lượng
    if (Quantity <= 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Quantity must be greater than 0." });
    }

    // Kiểm tra hàng tồn kho
    let cartItem = await Cart.findOne({
      where: { UserID, ProductID },
      transaction,
    });
    const currentQuantity = cartItem ? cartItem.Quantity : 0;
    const totalQuantity = currentQuantity + Quantity;
    if (totalQuantity > product.StockQuantity) {
      await transaction.rollback();
      return res
        .status(400)
        .json({
          error: `Not enough stock for ${product.ProductName}. Available: ${product.StockQuantity}, Requested: ${totalQuantity}.`,
        });
    }

    // Thêm hoặc cập nhật giỏ hàng
    if (cartItem) {
      await cartItem.update({ Quantity: totalQuantity }, { transaction });
    } else {
      cartItem = await Cart.create(
        { UserID, ProductID, Quantity },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json({ message: "Product added to cart.", cartItem });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Add to cart error: ${error.message}` });
  }
};

// Xem giỏ hàng
export const getCart = async (req, res) => {
  try {
    const { UserID } = req.user;
    const cartItems = await Cart.findAll({
      where: { UserID },
      include: [
        {
          model: Products,
          as: "Product",
          attributes: ["ProductID", "ProductName", "Price", "ImageURL"],
        },
      ],
      attributes: ["CartID", "ProductID", "Quantity", "AddedAt"],
    });

    // Tính tổng giá trước giảm giá
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += item.Product.Price * item.Quantity;
    }

    res.status(200).json({ cartItems, totalAmount });
  } catch (error) {
    res.status(500).json({ error: `Get cart error: ${error.message}` });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { id } = req.params;
    const { Quantity } = req.body;

    const cartItem = await Cart.findByPk(id, { transaction });
    if (!cartItem || cartItem.UserID !== UserID) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Cart item not found or unauthorized." });
    }

    // Kiểm tra số lượng
    if (Quantity <= 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Quantity must be greater than 0." });
    }

    // Kiểm tra hàng tồn kho
    const product = await Products.findByPk(cartItem.ProductID, {
      transaction,
    });
    if (Quantity > product.StockQuantity) {
      await transaction.rollback();
      return res
        .status(400)
        .json({
          error: `Not enough stock for ${product.ProductName}. Available: ${product.StockQuantity}, Requested: ${Quantity}.`,
        });
    }

    await cartItem.update({ Quantity }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: "Cart updated successfully." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Update cart error: ${error.message}` });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const deleteFromCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { UserID } = req.user;
    const { id } = req.params;

    const cartItem = await Cart.findByPk(id, { transaction });
    if (!cartItem || cartItem.UserID !== UserID) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Cart item not found or unauthorized." });
    }

    await cartItem.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Product removed from cart." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Delete from cart error: ${error.message}` });
  }
};
