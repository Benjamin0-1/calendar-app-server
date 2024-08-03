const { DataTypes } = require('sequelize');
const sequelize = require('../db');


// this is the Party model, here a party can have many users inside of it.
// and each party has a property (or many properties) associated to it.
// However, every Property only belongs to one specific Party.
// a Party belongs to the first user who created it, he will be the admin of it.
const Party =  sequelize.define('Party', {
    // party name
    party: {
        type: DataTypes.STRING,
        allowNull: null
    },

    // description for the party
    // there will be an option to change it or add one.
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'Esta es la descripcion de este grupo'
    },
});

module.exports = Party;
