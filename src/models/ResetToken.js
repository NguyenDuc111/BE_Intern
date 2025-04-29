import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ResetToken extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    TokenID: {
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
    Token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "Token"
    },
    ExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ResetToken',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "TokenID" },
        ]
      },
      {
        name: "Token",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Token" },
        ]
      },
      {
        name: "UserID",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
  }
}
