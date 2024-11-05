'use strict';

/** @type {import('sequelize-cli').Migration} */


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Juan',
        lastName: 'Lopez',
        role: 'Admin',
        email: 'juanlopez@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Maria',
        lastName: 'Perez',
        role: 'User',
        email: 'mariaperez@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Pedro',
        lastName: 'Gonzalez',
        role: 'User',
        email: 'pedrogonzalez@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Lucas',
        lastName: 'Rodriguez',
        role: 'User',
        email: 'lucasrodriguez@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Andrea',
        lastName: 'Romero',
        role: 'User',
        email: 'andrearomero@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Claudio',
        lastName: 'Gomez',
        role: 'User',
        email: 'claudiogomez@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Carolina',
        lastName: 'Ortiz',
        role: 'User',
        email: 'carolinaortiz@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Roberto',
        lastName: 'Silva',
        role: 'User',
        email: 'robertosilva@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Luisa',
        lastName: 'Garcia',
        role: 'User',
        email: 'luisagarcia@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Marcela',
        lastName: 'Hernandez',
        role: 'User',
        email: 'marcelahernandez@example.com',
        password: 'hola123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};


