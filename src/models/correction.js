'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Correction extends Model {
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
  Correction.init({
    userId: DataTypes.INTEGER,
    translatedSentenceId: DataTypes.INTEGER,
    wordSelected: DataTypes.STRING,
    wordIndex: DataTypes.INTEGER,
    errorType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Correction',
  });
  return Correction;
};