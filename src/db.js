const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Disable logging to avoid cluttering the console
  });
  
  // Set the timezone if needed
  sequelize.options.timezone = 'America/Mexico_City';
  
  module.exports = sequelize;

 /*
const sequelize = new Sequelize({
    database: 'Terraza',
    username: 'postgres',
    password: 'postgres', // was 12******
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;

*/
