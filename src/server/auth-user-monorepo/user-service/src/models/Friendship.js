// user-service/src/models/Friendship.js
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../../common/src/db/sequelize");
const User = require("./User");

class Friendship extends Model {}

Friendship.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  requester_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  addressee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },

  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
    defaultValue: 'pending',
    allowNull: false,
  }
}, {
  sequelize,
  modelName: "Friendship",
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['requester_id', 'addressee_id'] }]
});

User.hasMany(Friendship, {
  foreignKey: 'requester_id',
  as: 'SentRequests'
});
Friendship.belongsTo(User, {
  foreignKey: 'requester_id',
  as: 'Requester'
});

User.hasMany(Friendship, {
  foreignKey: 'addressee_id',
  as: 'ReceivedRequests'
});
Friendship.belongsTo(User, {
  foreignKey: 'addressee_id',
  as: 'Addressee'
});

module.exports = Friendship;