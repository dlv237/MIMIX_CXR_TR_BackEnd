'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportGroup extends Model {
    static associate(models) {
      this.belongsToMany(models.User, 
        { through: 'UserReportGroup', foreignKey: 'reportGroupId' });
      this.belongsToMany(models.Report,
         { through: 'ReportGroupReport', foreignKey: 'reportGroupId' });
   }
  }
  ReportGroup.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ReportGroup',
  });
  return ReportGroup;
};