import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Users extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    UserID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    RoleID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Roles',
        key: 'RoleID'
      }
    },
    FullName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "Email"
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'Users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "UserID" },
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
      {
        name: "RoleID",
        using: "BTREE",
        fields: [
          { name: "RoleID" },
        ]
      },
    ]
  });
  }
}
