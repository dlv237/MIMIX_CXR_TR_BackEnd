'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      background: {
        type: Sequelize.TEXT
      },
      findings: {
        type: Sequelize.TEXT
      },
      impression: {
        type: Sequelize.TEXT
      },
      report_translated: {
        type: Sequelize.TEXT
      },
      report_file: {
        type: Sequelize.TEXT
      },
      original_language: {
        type: Sequelize.STRING
      },
      mimic_id: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reports');
  }
};