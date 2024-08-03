const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    database: 'Terraza',
    username: 'postgres',
    password: '12241530', // was 12******
    host: 'localhost',
    dialect: 'postgres',
    logging: false
}); 

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;    

/*
  
const sequelize = new Sequelize({ // < - ALREADY DEPLOYED ON HEROKU.
  database: 'deid183oumsb3t',
  username: 'utc4n60886t2p',
  password: 'p2c1cc0a3788525f9eb31b95be499aa1b9b4df76d06af3ad4f35daf4742c188aa',
  host: 'cb889jp6h2eccm.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // This will enforce SSL
      rejectUnauthorized: false // This option bypasses the verification of the certificate
    }
  },
  logging: false,
});

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize; 
*/
