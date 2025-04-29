import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Categories extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    CategoryID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CategoryName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ImageURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Categories',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CategoryID" },
        ]
      },
    ]
  });
  }
}
