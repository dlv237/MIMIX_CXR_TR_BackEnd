'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      this.belongsToMany(models.ReportGroup, 
        { through: 'ReportGroupReport', 
        foreignKey: 'reportId' });
      this.hasMany(models.Sentence, {
          foreignKey: 'reportId',
          as: 'sentences', 
        });
      this.hasOne(models.TranslatedReport, {
        foreignKey: 'reportId', 
          });
    }
  }
  Report.init({
    userId: DataTypes.INTEGER,
    background: DataTypes.TEXT,
    findings: DataTypes.TEXT,
    impression: DataTypes.TEXT,
    report_translated: DataTypes.TEXT,
    report_file: DataTypes.TEXT,
    original_language: DataTypes.STRING,
    mimic_id: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING),
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};