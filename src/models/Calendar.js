const { DataTypes } = require('sequelize');
const sequelize = require('../db');
//postgres

const BookedDate = sequelize.define('BookedDate', {
    date_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    phone_number: {
        type: DataTypes.STRING, // STRING type since it can contain special characters such as '+, -'
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true 
    },

    // here goes the "apartado" field, which will have some validations at a route level.

 //   apartado: { // se puede agregar validacion para un minimo de apartado requerido. (lo cual se podra cambiar en el front)
 //       type: DataTypes.FLOAT, // PRICE WILL BE IN MXN / mexican pesos
 //       allowNull: false
 //   },

    custom_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    owner: {
        type: DataTypes.STRING,
        allowNull: false // was true
    },

    // al cliente al cual se le aparto la terraza
    person_who_booked: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
        get() {
            const dateValue = this.getDataValue('date');
            if (dateValue instanceof Date) {
                return dateValue.toLocaleDateString('en-US');
            } else {
                return dateValue; // Or handle the case differently based on your requirements
            }
        }
    }
}, {
    timestamps: true,
    updatedAt: true
});


module.exports = BookedDate;  


/*
// mysql
const BookedDate = sequelize.define('BookedDate', {
    date_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    phone_number: {
        type: DataTypes.STRING, // STRING type since it can contain special chars such as '+, -'
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    custom_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    owner: {
        type: DataTypes.STRING,
        allowNull: false // was true
    },
    person_who_booked: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
    },
    // Define the virtual attribute for formattedDate
    
}, {
    timestamps: true,
    updatedAt: true
});



module.exports = BookedDate;  */
