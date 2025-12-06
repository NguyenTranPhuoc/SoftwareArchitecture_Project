const { DataTypes, Model } = require("sequelize");
// CHANGE: Import sequelize
const { sequelize } = require("../../../common/src/db/sequelize");

class User extends Model {
  // This method is still useful
  toSafeObject() {
    const obj = this.toJSON();
    delete obj.password_hash;
    return obj;
  }
}

// CHANGE: Define model with Sequelize
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
  phone_number: { 
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },

  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  verification_token: {
    type: DataTypes.STRING,
    unique: true
  },
  verification_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verification_code_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,  modelName: "User",
  timestamps: true,
  underscored: true, // Use snake_case (created_at)
});

module.exports = User;
