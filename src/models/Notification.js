import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Notification extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    NotificationID: {
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
    Title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'Notification',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "NotificationID" },
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
