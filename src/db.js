const { Sequelize } = require('sequelize');
require('dotenv').config();

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

module.exports = sequelize;    

*/

const sequelize = new Sequelize({
  database: 'postgres',               // Default database name for Supabase
  username: 'postgres',               // Supabase username
  password: '#uen596sK!QQd.4',        // Supabase password
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 6543,                         // Default port for Supabase
  dialect: 'postgres',                // Use PostgreSQL dialect
  dialectOptions: {
    ssl: {
      require: true,                 // Enforce SSL connection
      rejectUnauthorized: false      // Bypass certificate verification
    }
  },
  logging: false,                     // Set to true if you want to see SQL queries
});

// Set timezone if needed
sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;
