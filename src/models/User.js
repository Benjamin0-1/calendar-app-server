const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    fist_name: {
        type: DataTypes.INTEGER,
        allownull: false
    },

    last_name: {
        type: DataTypes.STRING,
        allownull: false
    },

    password: {
        type: DataTypes.STRING,
        allownull: false
    },

    confirm_password: {
        type: DataTypes.STRING,
        allownull: false
    }

});


module.exports = User;