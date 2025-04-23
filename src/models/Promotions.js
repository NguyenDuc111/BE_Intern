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
    ProductID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'ProductID'
      }
    },
    DiscountPercentage: {
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
        name: "idx_product_id",
        using: "BTREE",
        fields: [
          { name: "ProductID" },
        ]
      },
    ]
  });
  }
}
