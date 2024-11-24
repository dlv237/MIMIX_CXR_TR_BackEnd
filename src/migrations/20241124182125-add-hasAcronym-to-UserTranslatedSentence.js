'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('UserTranslatedSentences', 'hasAcronym', {
      type: Sequelize.STRING,
    });

    await queryInterface.sequelize.query(
      `UPDATE "UserTranslatedSentences" SET "hasAcronym" = 'no seleccionado' WHERE "hasAcronym" IS NULL`
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('UserTranslatedSentences', 'hasAcronym');
  }
};
