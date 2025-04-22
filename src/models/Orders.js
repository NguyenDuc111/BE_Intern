import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Orders extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    OrderID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CustomerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'CustomerID'
      }
    },
    OrderDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    TotalAmount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    Status: {
      type: DataTypes.ENUM('Pending','Processing','Shipped','Delivered','Cancelled'),
      allowNull: true,
      defaultValue: "Pending"
    },
    ShippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Orders',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "OrderID" },
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
