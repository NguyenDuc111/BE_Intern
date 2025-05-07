import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Cart from "./Cart.js";
import _Categories from "./Categories.js";
import _LoyaltyPoints from "./LoyaltyPoints.js";
import _Notification from "./Notification.js";
import _OrderDetails from "./OrderDetails.js";
import _Orders from "./Orders.js";
import _ProductCategories from "./ProductCategories.js";
import _Products from "./Products.js";
import _Promotion from "./Promotion.js";
import _RedemptionHistory from "./RedemptionHistory.js";
import _ResetToken from "./ResetToken.js";
import _Reviews from "./Reviews.js";
import _Roles from "./Roles.js";
import _TempOrderItems from "./TempOrderItems.js";
import _UserRedemptionLimits from "./UserRedemptionLimits.js";
import _UserVouchers from "./UserVouchers.js";
import _Users from "./Users.js";
import _Vouchers from "./Vouchers.js";
import _Wishlists from "./Wishlists.js";

export default function initModels(sequelize) {
  const Cart = _Cart.init(sequelize, DataTypes);
  const Categories = _Categories.init(sequelize, DataTypes);
  const LoyaltyPoints = _LoyaltyPoints.init(sequelize, DataTypes);
  const Notification = _Notification.init(sequelize, DataTypes);
  const OrderDetails = _OrderDetails.init(sequelize, DataTypes);
  const Orders = _Orders.init(sequelize, DataTypes);
  const ProductCategories = _ProductCategories.init(sequelize, DataTypes);
  const Products = _Products.init(sequelize, DataTypes);
  const Promotion = _Promotion.init(sequelize, DataTypes);
  const RedemptionHistory = _RedemptionHistory.init(sequelize, DataTypes);
  const ResetToken = _ResetToken.init(sequelize, DataTypes);
  const Reviews = _Reviews.init(sequelize, DataTypes);
  const Roles = _Roles.init(sequelize, DataTypes);
  const TempOrderItems = _TempOrderItems.init(sequelize, DataTypes);
  const UserRedemptionLimits = _UserRedemptionLimits.init(sequelize, DataTypes);
  const UserVouchers = _UserVouchers.init(sequelize, DataTypes);
  const Users = _Users.init(sequelize, DataTypes);
  const Vouchers = _Vouchers.init(sequelize, DataTypes);
  const Wishlists = _Wishlists.init(sequelize, DataTypes);

  Categories.belongsToMany(Products, {
    as: "Products",
    through: ProductCategories,
    foreignKey: "CategoryID",
    otherKey: "ProductID",
  });
  Products.belongsToMany(Categories, {
    as: "Categories",
    through: ProductCategories,
    foreignKey: "ProductID",
    otherKey: "CategoryID",
  });
  Users.belongsToMany(Vouchers, {
    as: "VoucherID_Vouchers",
    through: UserRedemptionLimits,
    foreignKey: "UserID",
    otherKey: "VoucherID",
  });
  Vouchers.belongsToMany(Users, {
    as: "UserID_Users",
    through: UserRedemptionLimits,
    foreignKey: "VoucherID",
    otherKey: "UserID",
  });
  ProductCategories.belongsTo(Categories, {
    as: "Category",
    foreignKey: "CategoryID",
  });
  Categories.hasMany(ProductCategories, {
    as: "ProductCategories",
    foreignKey: "CategoryID",
  });
  OrderDetails.belongsTo(Orders, { as: "Order", foreignKey: "OrderID" });
  Orders.hasMany(OrderDetails, { as: "OrderDetails", foreignKey: "OrderID" });
  TempOrderItems.belongsTo(Orders, { as: "Order", foreignKey: "OrderID" });
  Orders.hasMany(TempOrderItems, {
    as: "TempOrderItems",
    foreignKey: "OrderID",
  });
  Cart.belongsTo(Products, { as: "Product", foreignKey: "ProductID" });
  Products.hasMany(Cart, { as: "Carts", foreignKey: "ProductID" });
  OrderDetails.belongsTo(Products, { as: "Product", foreignKey: "ProductID" });
  Products.hasMany(OrderDetails, {
    as: "OrderDetails",
    foreignKey: "ProductID",
  });
  ProductCategories.belongsTo(Products, {
    as: "Product",
    foreignKey: "ProductID",
  });
  Products.hasMany(ProductCategories, {
    as: "ProductCategories",
    foreignKey: "ProductID",
  });
  RedemptionHistory.belongsTo(Products, {
    as: "Product",
    foreignKey: "ProductID",
  });
  Products.hasMany(RedemptionHistory, {
    as: "RedemptionHistories",
    foreignKey: "ProductID",
  });
  Reviews.belongsTo(Products, { as: "Product", foreignKey: "ProductID" });
  Products.hasMany(Reviews, { as: "Reviews", foreignKey: "ProductID" });
  TempOrderItems.belongsTo(Products, {
    as: "Product",
    foreignKey: "ProductID",
  });
  Products.hasMany(TempOrderItems, {
    as: "TempOrderItems",
    foreignKey: "ProductID",
  });
  Wishlists.belongsTo(Products, { as: "Product", foreignKey: "ProductID" });
  Products.hasMany(Wishlists, { as: "Wishlists", foreignKey: "ProductID" });
  Orders.belongsTo(Promotion, { as: "Promotion", foreignKey: "PromotionID" });
  Promotion.hasMany(Orders, { as: "Orders", foreignKey: "PromotionID" });
  Users.belongsTo(Roles, { as: "Role", foreignKey: "RoleID" });
  Roles.hasMany(Users, { as: "Users", foreignKey: "RoleID" });
  Orders.belongsTo(UserVouchers, {
    as: "VoucherCode_UserVoucher",
    foreignKey: "VoucherCode",
  });
  UserVouchers.hasMany(Orders, { as: "Orders", foreignKey: "VoucherCode" });
  Cart.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(Cart, { as: "Carts", foreignKey: "UserID" });
  LoyaltyPoints.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(LoyaltyPoints, { as: "LoyaltyPoints", foreignKey: "UserID" });
  Notification.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(Notification, { as: "Notifications", foreignKey: "UserID" });
  Orders.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(Orders, { as: "Orders", foreignKey: "UserID" });
  RedemptionHistory.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(RedemptionHistory, {
    as: "RedemptionHistories",
    foreignKey: "UserID",
  });
  ResetToken.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(ResetToken, { as: "ResetTokens", foreignKey: "UserID" });
  Reviews.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(Reviews, { as: "Reviews", foreignKey: "UserID" });
  UserRedemptionLimits.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(UserRedemptionLimits, {
    as: "UserRedemptionLimits",
    foreignKey: "UserID",
  });
  UserVouchers.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(UserVouchers, { as: "UserVouchers", foreignKey: "UserID" });
  Wishlists.belongsTo(Users, { as: "User", foreignKey: "UserID" });
  Users.hasMany(Wishlists, { as: "Wishlists", foreignKey: "UserID" });
  RedemptionHistory.belongsTo(Vouchers, {
    as: "Voucher",
    foreignKey: "VoucherID",
  });
  Vouchers.hasMany(RedemptionHistory, {
    as: "RedemptionHistories",
    foreignKey: "VoucherID",
  });
  UserRedemptionLimits.belongsTo(Vouchers, {
    as: "Voucher",
    foreignKey: "VoucherID",
  });
  Vouchers.hasMany(UserRedemptionLimits, {
    as: "UserRedemptionLimits",
    foreignKey: "VoucherID",
  });
  UserVouchers.belongsTo(Vouchers, { as: "Voucher", foreignKey: "VoucherID" });
  Vouchers.hasMany(UserVouchers, {
    as: "UserVouchers",
    foreignKey: "VoucherID",
  });

  return {
    Cart,
    Categories,
    LoyaltyPoints,
    Notification,
    OrderDetails,
    Orders,
    ProductCategories,
    Products,
    Promotion,
    RedemptionHistory,
    ResetToken,
    Reviews,
    Roles,
    TempOrderItems,
    UserRedemptionLimits,
    UserVouchers,
    Users,
    Vouchers,
    Wishlists,
  };
}
