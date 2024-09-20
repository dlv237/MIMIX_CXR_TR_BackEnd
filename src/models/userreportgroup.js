'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserReportGroup extends Model {
    static associate(models)  {
      this.belongsTo(models.User, { foreignKey: 'userId' });
      this.belongsTo(models.ReportGroup, { foreignKey: 'reportGroupId' });
     }
  }
  UserReportGroup.init({
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    reportGroupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ReportGroup',
        key: 'id'
      }
    },
    progressTranslatedSentences: DataTypes.FLOAT,
    progressReports: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'UserReportGroup',
  });
  return UserReportGroup;
};