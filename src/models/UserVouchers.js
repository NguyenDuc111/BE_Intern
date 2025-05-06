import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UserVouchers extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    UserVoucherID: {
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
    VoucherID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vouchers',
        key: 'VoucherID'
      }
    },
    Code: {
      type: DataTypes.STRING(6),
      allowNull: false,
      unique: "Code"
    },
    Status: {
      type: DataTypes.ENUM('active','used','expired'),
      allowNull: true,
      defaultValue: "active"
    },
    UsageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'UserVouchers',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "UserVoucherID" },
        ]
      },
      {
        name: "Code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Code" },
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
    ]
  });
  }
}
