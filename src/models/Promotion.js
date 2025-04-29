import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Promotion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    PromotionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: "Code"
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DiscountPercentage: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Promotion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PromotionID" },
        ]
      },
      {
        name: "Code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Code" },
        ]
      },
    ]
  });
  }
}
