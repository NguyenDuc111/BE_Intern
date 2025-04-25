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

    // Kiểm tra kiểu dữ liệu
    if (!Number.isInteger(ProductID) || !Number.isInteger(Quantity)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "ProductID and Quantity must be integers." });
    }

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
      return res.status(400).json({
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
      attributes: ["CartID", "ProductID", "Quantity"],
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

    // Kiểm tra kiểu dữ liệu của id và Quantity
    const cartId = parseInt(id, 10);
    if (isNaN(cartId)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Cart ID must be a valid integer." });
    }

    if (!Number.isInteger(Quantity)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Quantity must be an integer." });
    }

    // Tìm bản ghi trong bảng Cart
    const cartItem = await Cart.findByPk(cartId, { transaction });
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

    // Tìm sản phẩm trong bảng Products
    const product = await Products.findByPk(cartItem.ProductID, {
      transaction,
    });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found." });
    }

    // Kiểm tra hàng tồn kho dựa trên tổng số lượng (không chỉ delta)
    const oldQuantity = cartItem.Quantity;
    const deltaQuantity = Quantity - oldQuantity;

    // Nếu tăng số lượng, kiểm tra xem có đủ hàng tồn kho không
    if (deltaQuantity > 0) {
      const availableStock = product.StockQuantity;
      if (deltaQuantity > availableStock) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Not enough stock for ${product.ProductName}. Available: ${availableStock}, Requested additional: ${deltaQuantity}.`,
        });
      }
    }

    // Cập nhật số lượng trong giỏ hàng
    await cartItem.update({ Quantity }, { transaction });

    // Cập nhật số lượng tồn kho trong bảng Products
    product.StockQuantity -= deltaQuantity;
    await product.save({ transaction });

    await transaction.commit();
    res.status(200).json({
      message: "Cart updated successfully.",
      cartItem: {
        CartID: cartItem.CartID,
        ProductID: cartItem.ProductID,
        Quantity: cartItem.Quantity,
      },
    });
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

    const cartId = parseInt(id, 10);
    if (isNaN(cartId)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Cart ID must be a valid integer." });
    }

    const cartItem = await Cart.findByPk(cartId, { transaction });
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
