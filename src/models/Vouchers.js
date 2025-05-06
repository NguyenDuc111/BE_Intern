import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Vouchers extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    VoucherID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    DiscountValue: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    PointsRequired: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UsageLimit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ExpiryDays: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Vouchers',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "VoucherID" },
        ]
      },
    ]
  });
  }
}
