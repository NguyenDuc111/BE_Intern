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
    },
    Rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Reviews',
    timestamps: false,
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
