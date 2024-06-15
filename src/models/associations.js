const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const BookedDate = require('./Calendar'); // <- different name, done intentionally.
const Owner = require('./Owner');
const DeletedDate = require('./DeletedDate'); // <-- keep track of everything.
