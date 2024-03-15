const { Op } = require('sequelize');
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const BookedDate = require('./models/Calendar');
const session = require('express-session');


const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://192.168.100.70:3000', 'http://192.168.100.65:3000'],
    credentials: true,
}

app.use(cors(corsOptions));


const PORT = process.env.PORT ||  4001

app.use(express.json());


app.use(
    session({
      secret: 'your-secret-key-admin-dash-2024', 
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, // https must be true
        httpOnly: true, // https must be false
        maxAge: 3600000 * 10000
      }
    })
  );
  


app.use('/', (req, res, next) => {
    req.isLoggedIn = req.session.isLoggedIn || false;
    next();
});


const isAuthenticatedMiddleware = (req, res, next) => {

    if (req.originalUrl === '/login') {
        return next();
    }

    if (req.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ access: false, message: 'Unauthorized' });
    }
};

// middleware to protect all routes, simple implementation so far.

//app.use(isAuthenticatedMiddleware); //

// Login route
app.post('/login', (req, res) => {
    console.log(req.session);
    // if user is authenticated then redirect/send message.
    if (req.session.isLoggedIn) {

        req.session.destroy(); // THIS LINE IS FOR DEBUGGING ONLY AND SHOULD BE CHECKED BACK LATER ! . creates a bug intentionally.

        return res.json({message: 'User is already authenticated' });
    }


    const { username, password } = req.body;
  
    try {
        console.log('Received login request with credentials:', username, password);
        console.log('session: ', req.session);

        if (username === 'Compadres' && password === 'Compadres2024') {
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

app.get('/deletebooking', async (req, res) => {
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


// route to update an existing booking, if it doesn't exist 
app.put('/updatebooking', async(req, res) => {
    const { dateToUpdate } = req.query;
    const {phone_number, name, custom_message} = req.body;
    try {
    // using findOne because each date is unique and this way it's also faster.
    const existingDate = await BookedDate.findOne({
        where: {date: dateToUpdate}
    });

    if (!existingDate) {
        res.status(404).json({notFoundError: 'No such date was found'})
    };

    fieldsToUpdate = {};
    if (phone_number) {
        fieldsToUpdate.phone_number = phone_number;
    };
    if (name) {
        fieldsToUpdate.name = name;
    };
    if (custom_message) {
        fieldsToUpdate.custom_message = custom_message;
    };

    if (Object.keys(fieldsToUpdate)) {
        await BookedDate.update(fieldsToUpdate, {
            where: {date: existingDate}
        })
    }
    res.send('Booking successfully updated')

} catch(error) {
        res.status(500).send('Internal Server Error')
      };
});

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










sequelize.sync().then(() => {
    app.listen(process.env.PORT || PORT, () => { // env port for deployment.
        console.log(`Server is running on port: ${PORT}`);
    })
});



