'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserTranslatedSentence extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId' });
      this.belongsTo(models.TranslatedSentence, {
        foreignKey: 'translatedsentenceId',
      });
    }
  }
  UserTranslatedSentence.init({
    userId: DataTypes.INTEGER,
    translatedsentenceId: DataTypes.INTEGER,
    state: DataTypes.BOOLEAN,
    isSelectedCheck: DataTypes.BOOLEAN,
    isSelectedTimes: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserTranslatedSentence',
  });
  return UserTranslatedSentence;
};