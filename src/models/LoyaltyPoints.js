import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class LoyaltyPoints extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    PointID: {
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
    Points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'LoyaltyPoints',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PointID" },
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
