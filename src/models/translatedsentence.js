'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TranslatedSentence extends Model {
    static associate(models) {
      this.belongsTo(models.Report, {
        foreignKey: 'reportId',
      });
      this.belongsTo(models.Sentence, {
        foreignKey: 'sentenceId',
      });
      // Agregamos la asociación para poder incluir las sugerencias
      this.hasMany(models.Suggestion, {
        foreignKey: 'translatedSentenceId',
        as: 'suggestions', // Alias para poder referenciar las sugerencias
        sourceKey: 'id'
      });
    }
  }
  TranslatedSentence.init({
    sentenceId: DataTypes.INTEGER,
    reportId: DataTypes.INTEGER,
    array_index: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    translated_sentence_type: DataTypes.STRING,
    hasComments: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'TranslatedSentence',
  });
  return TranslatedSentence;
};
