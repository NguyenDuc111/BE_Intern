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
    ProductName: {
      type: DataTypes.STRING(255),
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
      allowNull: false
    },
    ImageURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Ingredients: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Products',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ProductID" },
        ]
      },
    ]
  });
  }
}
