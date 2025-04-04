'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sentence extends Model {
    static associate(models) {
      this.belongsTo(models.Report, {
        foreignKey: 'reportId',
      });
      // Agregamos la asociación de Sentence a TranslatedSentence
      this.hasOne(models.TranslatedSentence, {
        foreignKey: 'sentenceId',
        as: 'translatedSentence', // Alias para poder referenciar la traducción
      });
      // Si también quieres asociar las sugerencias directamente a la oración:
      this.hasMany(models.Suggestion, {
        foreignKey: 'translatedSentenceId',
        sourceKey: 'id'
      });
    }
  }
  Sentence.init({
    reportId: DataTypes.INTEGER,
    array_index: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    sentence_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sentence',
  });
  return Sentence;
};
