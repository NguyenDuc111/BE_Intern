import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ProductCategories extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    ProductID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Products',
        key: 'ProductID'
      }
    },
    CategoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Categories',
        key: 'CategoryID'
      }
    }
  }, {
    sequelize,
    tableName: 'ProductCategories',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ProductID" },
          { name: "CategoryID" },
        ]
      },
      {
        name: "CategoryID",
        using: "BTREE",
        fields: [
          { name: "CategoryID" },
        ]
      },
    ]
  });
  }
}
