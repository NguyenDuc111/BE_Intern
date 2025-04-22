import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Reviews extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    ReviewID: {
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
    CustomerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'CustomerID'
      }
    },
    Rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Reviews',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ReviewID" },
        ]
      },
      {
        name: "ProductID",
        using: "BTREE",
        fields: [
          { name: "ProductID" },
        ]
      },
      {
        name: "CustomerID",
        using: "BTREE",
        fields: [
          { name: "CustomerID" },
        ]
      },
    ]
  });
  }
}
