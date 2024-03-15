const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    username: 'u5t3iugiosqfbh',
    password: 'pa571f199b7caf34ac82acc863720037402152df8989e16e8f48c3001d8e35148',
    database: 'd8uq1buokqri55',
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
