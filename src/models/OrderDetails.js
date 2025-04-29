import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class OrderDetails extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    OrderDetailID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    OrderID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Orders',
        key: 'OrderID'
      }
    },
    ProductID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'ProductID'
      }
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UnitPrice: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'OrderDetails',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "OrderDetailID" },
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
