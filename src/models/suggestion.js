'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Suggestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      this.belongsTo(models.TranslatedSentence, {
        foreignKey: 'translatedSentenceId',
      });
    }
  }
  Suggestion.init({
    userId: DataTypes.INTEGER,
    translatedSentenceId: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    state: DataTypes.BOOLEAN,
    comments: DataTypes.TEXT,
    changesFinalTranslation: DataTypes.TEXT,
    sentenceType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Suggestion',
  });
  return Suggestion;
};