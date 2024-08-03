const { Sequelize } = require('sequelize');
const dotenv = require('dotenv').config();
const fs = require('fs');



// Sequelize configuration
const sequelize = new Sequelize({
  database: 'defaultdb',
  username: 'avnadmin',
  password: 'AVNS_BceGPWTfyOY4G61295C',
  host: 'pg-1ce75fc8-oliver125125-2e2c.l.aivencloud.com',
  port: 15230,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Enforce SSL
      rejectUnauthorized: false, // Bypass certificate verification
   //   ca: sslCertificate // Include SSL certificate
    }
  },
  logging: false,
});

sequelize.options.timezone = 'America/Mexico_City';

module.exports = sequelize;


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
