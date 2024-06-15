const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// this model will keep a copy of every single deleted date.
// this table will store everything, meaning NO unique constraints.


// this model will store a copy of all the deleted dates, mandatory fields.
// but can be improved to contain more columns and mark them as allownull  true.
const DeletedDate = sequelize.define('DeletedDate', {
    // either "clone" the BookedDate model or do a relationship instead.

    phone_number: {
        type: DataTypes.STRING, // STRING type since it can contain special characters such as '+, -'
        allowNull: false
    },
    owner: {
        type: DataTypes.STRING,
        allowNull: false
    },

    person_who_booked: {
        type: DataTypes.STRING,
        allowNull: false
    },

    // this will simply store a copy of all.
    // therefore no need to mark it as unique.
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    custom_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: true
    },

});





module.exports = DeletedDate;
