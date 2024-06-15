const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// future marketing emails.
const NewsLetter = sequelize.define('NewsLetter', {
    email: {
        type: DataTypes.STRING, // will use regex at a route level.
        allowNull: false,
        unique: true  // will also include validations at a route level.
    }
});

module.exports = NewsLetter;

// it can have the functionality in which once a user gets registered,
// then such email will automatically be deleted from the NewsLetter table.
