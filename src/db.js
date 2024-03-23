const { Sequelize } = require('sequelize');
require('dotenv').config();

/*
//production: railway.
const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  logging: false, 
});

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize; */

/*
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    username: 'u5g2narkv6isdo',
    password: 'pe2704b8f1b22a06c6189764b4351137437a1e81a37502810e685abcd44d434ab',
    database: 'd6h2das5vbaqgb',
    host: 'cc3engiv0mo271.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
});
// will try everything from scratch, have db already set up before pushing the first commit. also pi

  sequelize.options.timezone = 'America/Mexico_City';
  
  module.exports = sequelize; 
*/

 /* <= localhost, development.
const sequelize = new Sequelize({
    database: 'Terraza',
    username: 'postgres',
    password: '12241530', // was 12******
    host: 'localhost',
    dialect: 'postgres',
    logging: false
}); 

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;   /*

/*
mysql
const sequelize = new Sequelize(process.env.DATABASE_URL, { <= this is WRONG, pass it down below instead.
    database: 'heroku_8a3e63a177b74ab', // was Terraza
    username: 'b35d03b5a47501', // was root
    password: 'c0a1b7b0', // was None
    host: 'us-cluster-east-01.k8s.cleardb.net',
    dialect: 'mysql',
    logging: false,
  //  timezone: 'America/Mexico_City',
});

//sequelize.options.timezone = 'America/Mexico_City'; 

module.exports = sequelize;  */

const sequelize = new Sequelize({
  database: 'deid183oumsb3t',
  username: 'utc4n60886t2p',
  password: 'p2c1cc0a3788525f9eb31b95be499aa1b9b4df76d06af3ad4f35daf4742c188aa',
  host: 'cb889jp6h2eccm.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  logging: false,
  dialect: 'postgres',
});

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;