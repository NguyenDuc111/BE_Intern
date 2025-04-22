import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Promotions extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    PromotionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    PromotionCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "PromotionCode"
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DiscountPercent: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    StartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    EndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Promotions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PromotionID" },
        ]
      },
      {
        name: "PromotionCode",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PromotionCode" },
        ]
      },
    ]
  });
  }
}
