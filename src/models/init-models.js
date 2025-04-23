import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Cart from  "./Cart.js";
import _Categories from  "./Categories.js";
import _LoyaltyPoints from  "./LoyaltyPoints.js";
import _Notifications from  "./Notifications.js";
import _OrderDetails from  "./OrderDetails.js";
import _Orders from  "./Orders.js";
import _Products from  "./Products.js";
import _Promotions from  "./Promotions.js";
import _ResetTokens from  "./ResetTokens.js";
import _Reviews from  "./Reviews.js";
import _Roles from  "./Roles.js";
import _Users from  "./Users.js";
import _Wishlists from  "./Wishlists.js";

export default function initModels(sequelize) {
  const Cart = _Cart.init(sequelize, DataTypes);
  const Categories = _Categories.init(sequelize, DataTypes);
  const LoyaltyPoints = _LoyaltyPoints.init(sequelize, DataTypes);
  const Notifications = _Notifications.init(sequelize, DataTypes);
  const OrderDetails = _OrderDetails.init(sequelize, DataTypes);
  const Orders = _Orders.init(sequelize, DataTypes);
  const Products = _Products.init(sequelize, DataTypes);
  const Promotions = _Promotions.init(sequelize, DataTypes);
  const ResetTokens = _ResetTokens.init(sequelize, DataTypes);
  const Reviews = _Reviews.init(sequelize, DataTypes);
  const Roles = _Roles.init(sequelize, DataTypes);
  const Users = _Users.init(sequelize, DataTypes);
  const Wishlists = _Wishlists.init(sequelize, DataTypes);

  Products.belongsTo(Categories, { as: "Category", foreignKey: "CategoryID"});
  Categories.hasMany(Products, { as: "Products", foreignKey: "CategoryID"});
  OrderDetails.belongsTo(Orders, { as: "Order", foreignKey: "OrderID"});
  Orders.hasMany(OrderDetails, { as: "OrderDetails", foreignKey: "OrderID"});
  Cart.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(Cart, { as: "Carts", foreignKey: "ProductID"});
  OrderDetails.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(OrderDetails, { as: "OrderDetails", foreignKey: "ProductID"});
  Promotions.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(Promotions, { as: "Promotions", foreignKey: "ProductID"});
  Reviews.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(Reviews, { as: "Reviews", foreignKey: "ProductID"});
  Wishlists.belongsTo(Products, { as: "Product", foreignKey: "ProductID"});
  Products.hasMany(Wishlists, { as: "Wishlists", foreignKey: "ProductID"});
  Users.belongsTo(Roles, { as: "Role", foreignKey: "RoleID"});
  Roles.hasMany(Users, { as: "Users", foreignKey: "RoleID"});
  Cart.belongsTo(Users, { as: "User", foreignKey: "UserID"});
  Users.hasMany(Cart, { as: "Carts", foreignKey: "UserID"});
  LoyaltyPoints.belongsTo(Users, { as: "User", foreignKey: "UserID"});
  Users.hasMany(LoyaltyPoints, { as: "LoyaltyPoints", foreignKey: "UserID"});
  Notifications.belongsTo(Users, { as: "User", foreignKey: "UserID"});
  Users.hasMany(Notifications, { as: "Notifications", foreignKey: "UserID"});
  Orders.belongsTo(Users, { as: "User", foreignKey: "UserID"});
  Users.hasMany(Orders, { as: "Orders", foreignKey: "UserID"});
  ResetTokens.belongsTo(Users, { as: "User", foreignKey: "UserID"});
  Users.hasMany(ResetTokens, { as: "ResetTokens", foreignKey: "UserID"});
  Reviews.belongsTo(Users, { as: "User", foreignKey: "UserID"});
  Users.hasMany(Reviews, { as: "Reviews", foreignKey: "UserID"});
  Wishlists.belongsTo(Users, { as: "User", foreignKey: "UserID"});
  Users.hasMany(Wishlists, { as: "Wishlists", foreignKey: "UserID"});

  return {
    Cart,
    Categories,
    LoyaltyPoints,
    Notifications,
    OrderDetails,
    Orders,
    Products,
    Promotions,
    ResetTokens,
    Reviews,
    Roles,
    Users,
    Wishlists,
  };
}
