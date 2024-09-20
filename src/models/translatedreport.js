'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TranslatedReport extends Model {
    static associate(models) {
      this.belongsTo(models.Report, {
        foreignKey: 'reportId',
      });
    }
  }
  TranslatedReport.init({
    model: DataTypes.STRING,
    translation_date: DataTypes.DATE,
    translation_language: DataTypes.STRING,
    reportId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TranslatedReport',
  });
  return TranslatedReport;
};