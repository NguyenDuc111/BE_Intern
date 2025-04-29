import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Roles extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    RoleID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    RoleName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "RoleName"
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Roles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RoleID" },
        ]
      },
      {
        name: "RoleName",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RoleName" },
        ]
      },
    ]
  });
  }
}
