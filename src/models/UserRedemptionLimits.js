import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UserRedemptionLimits extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    VoucherID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Vouchers',
        key: 'VoucherID'
      }
    },
    RedemptionCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'UserRedemptionLimits',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "UserID" },
          { name: "VoucherID" },
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
