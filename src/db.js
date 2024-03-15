const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    database: 'Terraza',
    username: 'postgres',
    password: '', // 
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;