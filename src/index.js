const { Op } = require('sequelize');
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const BookedDate = require('./models/Calendar');
const session = require('express-session');
//require('dotenv').config();

//const USERNAME = process.env.username; // for the login
//const PASSWORD = process.env.password; // for the login

const app = express();

const corsOptions = {
    origin: ['https://rad-otter-086d62.netlify.app'],
    credentials: true
};



app.use(cors(corsOptions));


const PORT = process.env.PORT ||  4001

app.use(express.json());


app.use(
    session({
      secret: 'random-long-secret-key-here', // Update with a strong and secure secret key
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true only in production
        httpOnly: true,
        maxAge: 3600000 // Set to the desired session expiration time in milliseconds
      }
    })
);

  


app.use('/', (req, res, next) => {
    req.isLoggedIn = req.session.isLoggedIn || false;
    next();
});


const isAuthenticatedMiddleware = (req, res, next) => {

    if (req.originalUrl === '/login' || req.method === 'GET') {
        return next();
    };

    if (req.isLoggedIn) {
        return next();
    } else {
        return res.status(401).json({ access: false, message: 'Unauthorized' });
    }
};

app.use(isAuthenticatedMiddleware); 

app.get('/check-auth', (req, res) => {
    if (req.session.isLoggedIn) {
        return res.json({authenticated: true})
    } else {
        return res.json({authenticated: false})
    }
});

// Login route
app.post('/login', (req, res) => {
    console.log(req.session);
    // if user is authenticated then redirect/send message.
    if (req.session.isLoggedIn) {
        console.log('User is already authenticated');
        return res.json({message: 'User is already authenticated' });
    }
;

    const { username, password } = req.body;
  
    try {
       // console.log('Received login request with credentials:', username, password);
       // console.log('session: ', req.session);

        if (username === 'Compadres' && password === 'Compadres2024') { // all caps are coming from the env file.
            req.session.isLoggedIn = true;
            console.log('Login successful!');
            res.json({ access: true, successMessage: true, session: req.session });
        } else {
            console.log('Incorrect credentials');
            res.status(401).json({ access: false, errorMessage: 'Incorrect credentials' });
        }
    } catch (error) {
        console.error(`Error logging in: ${error}`);
        res.status(500).json('Error logging in');
    }
});


  


// route to show all bookedDates
 app.get('/book', async(req, res) => {
    console.log(req.session);
    try {
        const dateCount = await BookedDate.count();
        if (dateCount > 0) {
            
        const allDates = await BookedDate.findAll({
            order: [['date', 'ASC']]
        });

        res.json(allDates); } else {
            res.json({message: 'No dates available to show', noDates: true})
        }
    } catch (error) {
        res.status(500).json({error: 'Internal server error'})
    }
 });


//route to book a date: most IMPORTANT one
// Route to book a date: most IMPORTANT one
app.post('/book', async (req, res) => {
    try {
        const { phone_number, email, custom_message, owner, person_who_booked, date } = req.body;

        const existingDate = await BookedDate.findOne({
            where: {
                date: date
            }
        });

        if (existingDate) {
            res.status(400).json({ success: false, message: 'Date already booked', isDateBooked: true });
            return;
        }

        const newBooking = await BookedDate.create({
            phone_number,
            email,
            custom_message,
            owner,
            person_who_booked,
            date
        });

        res.status(201).json(newBooking);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({success: false, message: 'Date is already Booked'})
        }
        console.error('LOGGING ERROR FROM CATCH BLOCK', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



//route to delete a date
app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const dateToDelete = await BookedDate.destroy({
            where: {
                date_id: id
            }
        });
        if (dateToDelete > 0) {
            res.status(201).json({success: true, message: `Date with ID: ${id} was successfully deleted`})
        } else {
            res.status(404).json({success: false, message: `No Booking with ID: ${id} was found`})
        };
        
    } catch (error) {
        res.status(500).json({error: 'Internal server error'})
    }
}); 


// Route to check if a specific date is available
// Using route parameter with regex for 'YYYY-MM-DD' format
app.get('/checkdate', async (req, res) => {
    const checkdate = req.query.checkdate;
    try {
        if (!checkdate || !isValidDate(checkdate)) {
            return res.status(400).json({ success: false, message: 'Missing or invalid date format (YYYY-MM-DD)' });
        }
        const existingDate = await BookedDate.findOne({
            where: {
                date: checkdate
            }
        });

        if (existingDate) {
            res.json({ success: true, message: 'Date is already booked' });
        } else {
            res.json({ success: true, message: `${checkdate} is available` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// regex to check YYYY-MM-DD Date format
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
};

app.delete('/deletebooking', async (req, res) => {
    const { deleteBooking } = req.query;

    if (!isValidDate(deleteBooking)) {
        return res.status(400).json({ message: 'Invalid date format' });
    }; // this works
    try {
        const existingDateToDelete = await BookedDate.findOne({
            where: {
                date: deleteBooking
            }
        });

        console.log(existingDateToDelete);

        if (existingDateToDelete) {
            // details:
            
            
            await existingDateToDelete.destroy({
                where: {
                    date: existingDateToDelete
                }
            });
            res.status(200).json({ message: 'Booking deleted successfully', wasDateDeleted: true });
        } else {
            res.status(404).json({ message: 'No date found', noDateFound: true });
            console.log(existingDateToDelete);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//route to get how many bookings per owner
app.get('/getbookingcount', async (req, res) => {
    try {
        const ricardoCount = await BookedDate.count({
            where: {
                owner: 'ricardo'
            }
        });

        const joseCount = await BookedDate.count({
            where: {
                owner: 'jose'
            }
        });

        const result = {
            ricardo: ricardoCount,
            jose: joseCount
        };

        res.json(result); // Send JSON response to the front-end
    } catch (error) {
        console.log('Catch block error:', error);
        res.status(500).json({ error: 'Internal server error' }); // Send JSON response for error
    }
});


// route to update an existing booking, all untouched values must remain the same as they were, this provides a better user experience.
/*
app.put('/updatebooking/:dateToUpdate', async (req, res) => {
    const { dateToUpdate } = req.params;
    const { person_who_booked, phone_number, email, custom_message, owner } = req.body;
    
    try {
        const existingDate = await BookedDate.findOne({
            where: { date: dateToUpdate }
        });

        if (!existingDate) {
            return res.status(404).json({ notFoundError: 'No such date was found' });
        }

        // Make sure at least 1 value is passed
        if (!person_who_booked && !phone_number && !email && !custom_message && !owner) {
            return res.status(400).json({ message: 'Must pass at least 1 value to update' });
        }

        // Prepare fields to update
        const fieldsToUpdate = {};

        if (person_who_booked) {
            fieldsToUpdate.person_who_booked = person_who_booked;
        }

        if (phone_number) {
            fieldsToUpdate.phone_number = phone_number;
        }

        if (email) {
            fieldsToUpdate.email = email;
        }

        if (custom_message) {
            fieldsToUpdate.custom_message = custom_message;
        }

        if (owner) {
            fieldsToUpdate.owner = owner;
        }

        // Update the booking only if there are fields to update
        if (Object.keys(fieldsToUpdate).length > 0) {
            await BookedDate.update(fieldsToUpdate, {
                where: { date: dateToUpdate }
            });
        }

        // Retrieve the updated booking
        const updatedBooking = await BookedDate.findOne({
            where: { date: dateToUpdate }
        });

        // Format date if needed (optional)
        if (updatedBooking) {
            // Perform any date formatting here if necessary
        }

        // Return the updated booking
        res.status(200).json({ successMessage: `Fecha: ${dateToUpdate} actualizada con exito`, updatedBooking });

    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).send('Internal Server Error');
    }
}); */





// so far it worked with jane doe only 1 person who booked with such name.
app.get('/searchbypersonwhobooked', async(req, res) => {
    const { searchbypersonwhobooked } = req.query;
    try {
        if (!searchbypersonwhobooked) {
            res.status(400).send('Must provide a valid name')
        };
        const existingPerson = await BookedDate.findAll({
            where: {person_who_booked: searchbypersonwhobooked}
        });
        if (!existingPerson) {
            res.status(404).send('No person with such name was found')
        } 
        res.json(existingPerson); // must respond with all date details where the name matches.

    } catch (error) {
        res.status(500).send('Internal Server Error')
    }
});

//route to search a date by phone_number
app.get('/searchbyphone', async(req, res) => { 
    const { searchbyphone } = req.query; // phone_number is of type STRING in model. So no need to convert it to a number
    try {
        if (!searchbyphone) {
            res.status(400).send('Must provide a phone number')
        };
        const existingPhoneNumber = await BookedDate.findAll({
            where: {phone_number: searchbyphone}
        });
        if (!existingPhoneNumber) {
            res.status(404).json({noPhoneFound: true, message: 'No date with such phone number was found'})
        }
        res.json(existingPhoneNumber);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//Fixed.
app.get('/searchbydaterange', async (req, res) => {
    const { start, end } = req.query;
    console.log('start: ', start, 'end: ', end);

    try {
        if (!isValidDate(start) || !isValidDate(end)) {
            res.status(400).send('Invalid date format');
            return;
        }

        const result = await BookedDate.findAll({
            where: {
                date: {
                    [Op.between]: [new Date(start), new Date(end)]
                }
            }
        });

        console.log('RESULT: ', result);

        if (result.length > 0) {
            res.json(result);
        } else {
            res.status(500).json({error: 'No dates were found'})
        }
    } catch (error) {
        console.log(`ERROR FROM CATCH: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

//deletebyname (all).
app.delete('/deletebyname/:name', async(req, res) => {
    const name = req.params.name;
    if (!name) {
        return res.status(400).json({message: 'Missing name field'});
    };
    if (name.length > 50) {
        return res.status(400).json({message: 'Name is too long', enteredName: name});
    };

    try {
        const datesToDelete = BookedDate.findAll({
            where: {
                person_who_booked:name
            }
        });

        const datesCount = await BookedDate.count({
            where: {person_who_booked: name}});

        if (datesCount === 0){
            return res.status(404).send({notFoundMessage: `No se encontraron fechas con el nombre de cliente: ${name}`});
        };

        await BookedDate.destroy({
            where: {
                person_who_booked: name
            }
        });

        res.json({successMessage: `Se han eliminado: ${datesCount} fechas con el nombre de cliente: ${name}`});

    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`);
    }
});

//detelebyphone (all).
app.delete('/deletebyphone/:number', async (req, res) => {
    const number = req.params.number;

    if (!/^[0-9]+$/.test(number)) {return res.status(400).json({invalidNumberMessage: `Numero telefonico invalido: ${number}`})};

    if (!number) {
        return res.status(400).json('Phone Number missing.');
    };
    if (number.length < 7) {
        return res.status(400).json(`Phone number is too short: ${number}`);
    };
    if (number.length > 50) {return res.status(400).json({tooLongNumMessage: `numero telefonico demasiado largo: ${number}`})};


    try {
        const phoneNumbersCount = await BookedDate.count({
            where: { phone_number: number }
        });

        if (phoneNumbersCount === 0) {
            return res.status(404).json({ notFoundMessage: `No se ha encontrado ninguna fecha con el numero telefonico: ${number}` });
        }

        await BookedDate.destroy({
            where: {
                phone_number: number
            }
        });

        return res.status(201).json({ successMessage: `Se han eliminado: ${phoneNumbersCount} fechas con el numero telefonico: ${number}` });
    } catch (error) {
        return res.status(500).json(`Internal Server Error: ${error}`);
    }
});


//deletebydaterange(all).
app.delete('/deletebyrange/:start/:end', async (req, res) => {
    const { start, end } = req.params;

    if (!start || !end) {
        return res.status(400).json({ message: 'Missing date fields' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
        return res.status(400).json({ invalidDateFormat: `Invalid date format: ${start} ${end}` });
    };

    const currentDate = new Date();

    try {
        const datesCount = await BookedDate.count({
            where: {
                date: {
                    [Op.between]: [start, end] // Use variables instead of strings
                }
            }
        });

        if (datesCount === 0) {
            return res.status(404).json({ notFoundMessage: `No se encontraron fechas entre ${start} y ${end}` });
        }

        await BookedDate.destroy({
            where: {
                date: {
                    [Op.between]: [start, end] // Use variables instead of strings
                }
            }
        });

        return res.status(201).json({ successMessage: `Se han eliminado ${datesCount} fechas con el rango proporcionado, inicio: ${start} fin: ${end}` });
    } catch (error) {
        return res.status(500).json(`Internal Server Error: ${error}`);
    }
});



sequelize.sync().then(() => {
    app.listen(process.env.PORT || PORT, () => { // env port for deployment.
        console.log(`Server is running on port: ${PORT}`);
    })
});



