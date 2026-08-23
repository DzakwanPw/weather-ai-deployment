'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QueryLog extends Model {
    static associate(models) {
      QueryLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  QueryLog.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kota: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data_cuaca: {
      type: DataTypes.TEXT
    },
    respon_ai: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'QueryLog',
    tableName: 'query_logs',
    underscored: true
  });
  return QueryLog;
};