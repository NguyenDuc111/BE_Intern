import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Customers extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    CustomerID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    FullName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "Email"
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Customers',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CustomerID" },
        ]
      },
      {
        name: "Email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Email" },
        ]
      },
    ]
  });
  }
}
