const { Sequelize } = require('sequelize');

/*

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    username: 'u5t3iugiosqfbh',
    password: 'pa571f199b7caf34ac82acc863720037402152df8989e16e8f48c3001d8e35148',
    database: 'd8uq1buokqri55',
    host: 'cb889jp6h2eccm.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
});
  
  // Set the timezone if needed
  sequelize.options.timezone = 'America/Mexico_City';
  
  module.exports = sequelize; */

 /*
const sequelize = new Sequelize({
    database: 'Terraza',
    username: 'postgres',
    password: '12241530', // was 12******
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;  */



const sequelize = new Sequelize(process.env.DATABASE_URL, {
    database: 'heroku_8a3e63a177b74ab', // was Terraza
    username: 'b35d03b5a47501', // was root
    password: 'c0a1b7b0', // was None
    host: 'us-cluster-east-01.k8s.cleardb.net',
    dialect: 'mysql',
    logging: false,
  //  timezone: 'America/Mexico_City',
});

//sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize; 