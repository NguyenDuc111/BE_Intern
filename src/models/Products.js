import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Products extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    ProductID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CategoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'CategoryID'
      }
    },
    ProductName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    StockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ImageURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Products',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ProductID" },
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
