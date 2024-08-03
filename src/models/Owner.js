const { DataTypes } = require('sequelize');
const sequelize = require('../db');
// require Party model here.

// this model has a many=to-many with Email.
// an owner can be added by an existing User, they all share the same credentials.
// whenever an owner books a date, it should be secure (they should introduce some kind of unique code or something similar).
// which ensures that all dates booked by a specific owner actually belong to that specific owner and no one else booked it.
const Owner = sequelize.define('Owner', {

});



module.exports = Owner;
