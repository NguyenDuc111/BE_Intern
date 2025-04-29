import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class TempOrderItems extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    TempID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    OrderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'OrderID'
      }
    },
    ProductID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'ProductID'
      }
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'TempOrderItems',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "TempID" },
        ]
      },
      {
        name: "OrderID",
        using: "BTREE",
        fields: [
          { name: "OrderID" },
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
