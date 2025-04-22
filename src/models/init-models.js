import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Cart from  "./Cart.js";
import _Categories from  "./Categories.js";
import _Customers from  "./Customers.js";
import _OrderDetails from  "./OrderDetails.js";
import _Orders from  "./Orders.js";
import _Products from  "./Products.js";
import _Promotions from  "./Promotions.js";
import _Reviews from  "./Reviews.js";

export default function initModels(sequelize) {
  const Cart = _Cart.init(sequelize, DataTypes);
  const Categories = _Categories.init(sequelize, DataTypes);
  const Customers = _Customers.init(sequelize, DataTypes);
  const OrderDetails = _OrderDetails.init(sequelize, DataTypes);
  const Orders = _Orders.init(sequelize, DataTypes);
  const Products = _Products.init(sequelize, DataTypes);
  const Promotions = _Promotions.init(sequelize, DataTypes);
  const Reviews = _Reviews.init(sequelize, DataTypes);

  Products.belongsTo(Categories, { as: "Category", foreignKey: "CategoryID"});
  Categories.hasMany(Products, { as: "Products", foreignKey: "CategoryID"});
  Cart.belongsTo(Customers, { as: "Customer", foreignKey: "CustomerID"});
  Customers.hasMany(Cart, { as: "Carts", foreignKey: "CustomerID"});
  Orders.belongsTo(Customers, { as: "Customer", foreignKey: "CustomerID"});
  Customers.hasMany(Orders, { as: "Orders", foreignKey: "CustomerID"});
  Reviews.belongsTo(Customers, { as: "Customer", foreignKey: "CustomerID"});
  Customers.hasMany(Reviews, { as: "Reviews", foreignKey: "CustomerID"});
  OrderDetails.belongsTo(Orders, { as: "Order", foreignKey: "OrderID"});
  Orders.hasMany(OrderDetails, { as: "OrderDetails", foreignKey: "OrderID"});
  Cart.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(Cart, { as: "Carts", foreignKey: "ProductID"});
  OrderDetails.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(OrderDetails, { as: "OrderDetails", foreignKey: "ProductID"});
  Reviews.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(Reviews, { as: "Reviews", foreignKey: "ProductID"});

  return {
    Cart,
    Categories,
    Customers,
    OrderDetails,
    Orders,
    Products,
    Promotions,
    Reviews,
  };
}
