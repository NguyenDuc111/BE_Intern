import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class LoyaltyPoints extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    LoyaltyID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      }
    },
    Points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    Description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    EarnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
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
          { name: "LoyaltyID" },
        ]
      },
      {
        name: "idx_user_id",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
  }
}
