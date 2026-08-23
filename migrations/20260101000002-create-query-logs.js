'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('query_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      kota: {
        type: Sequelize.STRING,
        allowNull: false
      },
      data_cuaca: {
        type: Sequelize.TEXT
      },
      respon_ai: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('query_logs');
  }
};
