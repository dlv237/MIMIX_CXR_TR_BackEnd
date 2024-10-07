'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna lastTranslatedReportId a la tabla userReportGroup
    await queryInterface.addColumn('UserReportGroups', 'lastTranslatedReportId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna lastTranslatedReportId si deshaces la migración
    await queryInterface.removeColumn('UserReportGroups', 'lastTranslatedReportId');
  }
};
