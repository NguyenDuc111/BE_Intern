import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Wishlists extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    WishlistID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    ProductID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'ProductID'
      }
    }
  }, {
    sequelize,
    tableName: 'Wishlists',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "WishlistID" },
        ]
      },
      {
        name: "UserID",
        using: "BTREE",
        fields: [
          { name: "UserID" },
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
