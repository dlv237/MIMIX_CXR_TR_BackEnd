'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sentence extends Model {
    static associate(models) {
      this.belongsTo(models.Report, {
        foreignKey: 'reportId',
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