'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportGroupReport extends Model {
    static associate(models) {
      this.belongsTo(models.Report, { foreignKey: 'reportId' });
      this.belongsTo(models.ReportGroup, { foreignKey: 'reportGroupId' });
    }
  }
  ReportGroupReport.init({
    reportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Report',
        key: 'id'
      }
    },
    reportGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ReportGroup',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ReportGroupReport',
  });
  return ReportGroupReport;
};