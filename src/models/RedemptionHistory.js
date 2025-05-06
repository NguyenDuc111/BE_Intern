import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class RedemptionHistory extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    RedemptionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    PointsUsed: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RedemptionType: {
      type: DataTypes.ENUM('voucher','gift'),
      allowNull: false
    },
    VoucherID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Vouchers',
        key: 'VoucherID'
      }
    },
    ProductID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'ProductID'
      }
    },
    RedemptionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    Status: {
      type: DataTypes.ENUM('pending','completed','cancelled'),
      allowNull: true,
      defaultValue: "pending"
    }
  }, {
    sequelize,
    tableName: 'RedemptionHistory',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RedemptionID" },
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
        name: "VoucherID",
        using: "BTREE",
        fields: [
          { name: "VoucherID" },
        ]
      },
      {
        name: "ProductID",
        using: "BTREE",
        fields: [
          { name: "ProductID" },
        ]
      },
    ]
  });
  }
}
