import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Orders extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    OrderID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    PromotionID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Promotion',
        key: 'PromotionID'
      }
    },
    TotalAmount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    Status: {
      type: DataTypes.ENUM('Pending','Processing','Paid','Cancelled'),
      allowNull: true,
      defaultValue: "Pending"
    },
    ShippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VoucherCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
      references: {
        model: 'UserVouchers',
        key: 'Code'
      }
    }
  }, {
    sequelize,
    tableName: 'Orders',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "OrderID" },
        ]
      },
      {
        name: "UserID",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
      {
        name: "PromotionID",
        using: "BTREE",
        fields: [
          { name: "PromotionID" },
        ]
      },
      {
        name: "Orders_ibfk_3",
        using: "BTREE",
        fields: [
          { name: "VoucherCode" },
        ]
      },
    ]
  });
  }
}
