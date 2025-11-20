const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../../common/src/db/sequelize");

class User extends Model {
  toSafeObject() {
    const obj = this.toJSON();
    delete obj.password_hash;
    return obj;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, index: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING },
  avatar_url: { type: DataTypes.STRING },
  date_of_birth: { type: DataTypes.DATE },

  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  verification_token: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  sequelize,
  modelName: "User",
  timestamps: true,
  underscored: true,
});

module.exports = User;