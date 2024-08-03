const { Op } = require('sequelize');
const express = require('express');
const sequelize = require('./db');
const BookedDate = require('./models/Calendar');
const DeletedDate = require('./models/DeletedDate') // to keep track of deleted dates.
const NewsLetter = require('./models/NewsLetter'); // new model.
const jwt = require('jsonwebtoken'); // moving from sessions to JWTS
const nodemailer = require('nodemailer'); // for notifications to both emails.
const cors = require('cors');
const limiter = require('express-rate-limit'); // avoid 
const loginRateLimitter = require('./middlewares/loginRateLimitter');

require('dotenv').config();

 
const USERNAME = process.env.USERNAME; // for the login
const PASSWORD = process.env.PASSWORD; // for the login
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const JOSE_EMAIL = process.env.JOSE_EMAIL;
const RICARDO_EMAIL = process.env.RICARDO_EMAIL;
const CONSUELO_EMAIL = process.env.CONSUELO_EMAIL;

// all user emails, they will get notified whenever a new date gets booked.
const ALL_USER_EMAILS = [
    //'cinthyaaf@outlook.com',
    //'consueloruflo@gmail.com',    <- ENABLE LATER.
    'olivermarco12@gmail.com',
];


// MUST RUN MIGRATIONS. (apartado) <-- until then, nothing is working for now.
function isAuthenticated(req, res, next){
    // first, extract the jwt
    const token = req.headers['authorization']; 
    // if not token then don't even bother
    if (!token) {
        return res.status(400).json('Must provide a token');
    };

    // if token then verify it.
    try {
        
        // provide access (short-lived) token.
        const decoded = jwt.verify(token.split(' ')[1], ACCESS_SECRET)
        req.user = decoded
        return next();

    } catch (error) {
        return res.status(401).json({message: 'Invalid token'})
    }
};

// nodemailer setup
const nodemailerOptions = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
};

// transporter for node mailer
// this function should go in the utils folder.
async function initializeTransporter() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    return transporter;
}



// send mail function, <-- it should also go inside the utils folder.
// verify that the change from message to body was successful.
async function sendMail(transporter, to, subject, body) {
    try {
        const htmlBody = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }
                    .header {
                        background-color: #007bff;
                        color: #ffffff;
                        padding: 10px 20px;
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .body {
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .footer {
                        text-align: center;
                        padding: 10px 20px;
                        font-size: 14px;
                        color: #666666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${subject}
                    </div>
                    <div class="body">
                        <p>${body}</p>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `;

        const info = await transporter.sendMail({
            from: nodemailerOptions.auth.user,
            to: to,
            subject: subject,
            text: body,
            html: htmlBody
        });

        console.log(`Message sent: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        console.error(`Error sending email to ${to}: ${error}`);
        throw error;
    }
};


// and that would complete the nodemailer configuration.



// extra function to check for admin privileges and partys.

const app = express();
app.use(express.json());
// Add CORS middleware
app.use(cors({
    origin:  process.env.FRONT_END_URL || 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, JWTs, etc.)
  }));

const PORT = process.env.PORT ||  4001

// Login route
// will change to only one type of token.
app.post('/login', loginRateLimitter, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Missing required data', missingCredentials: true });
    }

    // Example: check username and password against database
    if (username === 'Compadres' && password === 'Compadres2024') {
        try {
            const accessToken = jwt.sign({ username }, 'kdoaj4985748hcjkskdoap', { expiresIn: '2000m' }); // < THIS IS FOR TESTING.
            const refreshToken = jwt.sign({ username }, 'gjlasdf90329r893sklsad', { expiresIn: '360d' });

            res.json({ access: true, accessToken, refreshToken });
        } catch (error) {
            console.error(`Error generating tokens: ${error}`);
            res.status(500).json({ access: false, errorMessage: 'Internal server error' });
        }
    } else {
        res.status(401).json({ access: false, errorMessage: 'Incorrect credentials' }); // add how many seconds left if too many attempts.
    }
});



// GET a new access token.
app.post('/access-token', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign({ username: user.username }, ACCESS_SECRET, { expiresIn: '200m' });

        res.json({ accessToken: newAccessToken });
    });
});


app.get('/profile', isAuthenticated, (req, res) => { 
    const username = req.user.username;
    res.json({ username });
})

app.post('/access-token', async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided.' });
    }

    try {
        jwt.verify(refreshToken, REFRESH_SECRET, (error, decoded) => {
            if (error) {
                return res.status(401).json({ invalidToken: 'Invalid refresh token' });
            }

            // If the refresh token is valid, generate a new access token
            const accessToken = jwt.sign({ username: decoded.username }, ACCESS_SECRET, { expiresIn: '200m' });
            res.json({ accessToken });
        });
    } catch (error) {
        console.error('Error refreshing access token:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

  

// when booking, send emails to both of them.
// route to show all bookedDates
 app.get('/book', isAuthenticated, async(req, res) => {

    try {
        const dateCount = await BookedDate.count();
        if (dateCount > 0) {
            
        const allDates = await BookedDate.findAll({
            order: [['date', 'ASC']],
            
        });

        res.json(allDates); } else {
            res.json({message: 'No dates available to show', noDates: true})
        }
    } catch (error) {
        res.status(500).json({error: 'Internal server error'})
    }
 });


/*
app.post('/book', isAuthenticated, async (req, res) => {
    try {
        const { phone_number, email, custom_message, owner, person_who_booked, date } = req.body;

        // make sure it is all the required data excluding the optional ones.
        if (!phone_number || !email || !owner || !person_who_booked || !date) {
            return res.status(400).json('Missing required data')
        };

        // apartado is a FLOAT
   

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
         //   apartado, // ahora va el apartado <-- the minimum amount can be validated at the client level.
         // also if apartado exists, then let them book otherwise throw an error.
         // also they can check a box saying "apartado dado en full", this logic needs to be handled correctly
            custom_message,
            owner,
            person_who_booked,
            date
        });

        // here send the emails to the owners.

        res.status(201).json(newBooking);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({success: false, message: 'Date is already Booked'})
        }
        console.error('LOGGING ERROR FROM CATCH BLOCK', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}); */

app.post('/book',isAuthenticated, async (req, res) => {
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

        // here send the email
        const transporter = await initializeTransporter();
        const subject = 'nueva fecha agendada.'
        const body = `Una nueva fecha ha sido agendada para el dia: ${date}.
        agendada por ${owner}. Nombre de cliente: ${person_who_booked} . numero telefonico de cliente: ${phone_number}`

        // loop and email every user inside the list.
        for (const userEmail of ALL_USER_EMAILS) {
            await sendMail(transporter, userEmail, subject, body)
        };

        res.status(201).json(newBooking);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ success: false, message: 'Date is already Booked' });
            return; // Stop further execution
        }
        console.error('LOGGING ERROR FROM CATCH BLOCK', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



// we can do soft deletion and then keep records of all the deleted books.
//route to delete a date
app.delete('/delete/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;

    // first look for the date and if found then proceed to delete it.
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
app.get('/checkdate', isAuthenticated,  async (req, res) => {
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

// new route to see all of the available dates (I know...)
app.get('/all-available-dates', isAuthenticated, async(req, res) => {
    try {
        
        // find all the available dates.
        const allAvailableDates = await BookedDate.findAll({where: {date: null}});

        if (allAvailableDates.length === 0) {
            return res.status(404).json({message: 'No dates available', noDatesAvailableFound: true})
        };

        res.json(allAvailableDates)

    } catch (error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
});

// regex to check YYYY-MM-DD Date format
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
};

app.delete('/deletebooking', isAuthenticated, async (req, res) => {
    const { deleteBooking } = req.query;

    if (!isValidDate(deleteBooking)) {
        return res.status(400).json({ message: 'Invalid date format' });
    }

    try {
        const existingDateToDelete = await BookedDate.findOne({
            where: {
                date: deleteBooking
            }
        });

        if (existingDateToDelete) {
            // create a single copy because that is what this route does.
            const deletedDate = await DeletedDate.create({
                phone_number: existingDateToDelete.phone_number,
                owner: existingDateToDelete.owner,
                person_who_booked: existingDateToDelete.person_who_booked,
                date: existingDateToDelete.date,
                custom_message: existingDateToDelete.custom_message,
                email: existingDateToDelete.email
            });

            await existingDateToDelete.destroy();

            res.status(200).json({ message: 'Booking deleted successfully', wasDateDeleted: true });
        } else {
            res.status(404).json({ message: 'No date found', noDateFound: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



//route to get how many bookings per owner
app.get('/getbookingcount', isAuthenticated, async (req, res) => {
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
app.get('/searchbypersonwhobooked', isAuthenticated, async(req, res) => {
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
app.get('/searchbyphone', isAuthenticated, async(req, res) => { 
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
app.get('/searchbydaterange', isAuthenticated, async (req, res) => {
    const { start, end } = req.query;
    console.log('start: ', start, 'end: ', end);

    try {

        // these few lines will be commented since in the front end
        // users will use a "date" field form.
     //   if (!isValidDate(start) || !isValidDate(end)) {
     //       res.status(400).send('Invalid date format');
     //       return;
     //   }

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
            res.status(404).json({error: 'No dates were found'})
        }
    } catch (error) {
        console.log(`ERROR FROM CATCH: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

//deletebyname (all).
app.delete('/deletebyname/:name', isAuthenticated, async(req, res) => {
    const name = req.params.name;
    if (!name) {
        return res.status(400).json({message: 'Missing name field'});
    };
    if (name.length > 50) {
        return res.status(400).json({message: 'Name is too long', enteredName: name});
    };

    try {
        const datesToDelete = await BookedDate.findAll({
            where: {
                person_who_booked:name
            }
        });

        const datesCount = await BookedDate.count({
            where: {person_who_booked: name}});

        if (datesCount === 0){
            return res.status(404).send({notFoundMessage: `No se encontraron fechas con el nombre de cliente: ${name}`});
        };

        // before deleting, create the copy.
        const deletedDates = await DeletedDate.bulkCreate(datesToDelete.map(date => ({
            phone_number: date.phone_number,
            owner: date.owner,
            person_who_booked: date.person_who_booked,
            date: date.date,
            custom_message: date.custom_message,
            email: date.email
        }))); 


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
app.delete('/deletebyphone/:number', isAuthenticated, async (req, res) => {
    const number = req.params.number;

    if (!/^[0-9]+$/.test(number)) {
        return res.status(400).json({ invalidNumberMessage: `Numero telefonico invalido: ${number}` });
    }

    if (!number) {
        return res.status(400).json({ errorMessage: 'Phone Number missing.' });
    }
    if (number.length < 7) {
        return res.status(400).json({ errorMessage: `Phone number is too short: ${number}` });
    }
    if (number.length > 50) {
        return res.status(400).json({ tooLongNumMessage: `numero telefonico demasiado largo: ${number}` });
    }

    try {
        const datesToDelete = await BookedDate.findAll({
            where: { phone_number: number }
        });

        if (datesToDelete.length === 0) {
            return res.status(404).json({ notFoundMessage: `No se ha encontrado ninguna fecha con el numero telefonico: ${number}` });
        }

        // before deleting, create the copy.
        const deletedDates = await DeletedDate.bulkCreate(datesToDelete.map(date => ({
            phone_number: date.phone_number,
            owner: date.owner,
            person_who_booked: date.person_who_booked,
            date: date.date,
            custom_message: date.custom_message,
            email: date.email
        }))); 

        await BookedDate.destroy({
            where: {
                phone_number: number
            }
        });

        return res.status(201).json({ successMessage: `Se han eliminado: ${datesToDelete.length} fechas con el numero telefonico: ${number}` });
    } catch (error) {
        return res.status(500).json({ errorMessage: `Internal Server Error: ${error}` });
    }
});



//deletebydaterange(all).
app.delete('/deletebyrange/:start/:end', isAuthenticated, async (req, res) => {
    const { start, end } = req.params;

    if (!start || !end) {
        return res.status(400).json({ message: 'Missing date fields' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
        return res.status(400).json({ invalidDateFormat: `Invalid date format: ${start} ${end}` });
    }

    try {
        const datesToDelete = await BookedDate.findAll({
            where: {
                date: {
                    [Op.between]: [start, end]
                }
            }
        });

        const datesCount = datesToDelete.length;

        if (datesCount === 0) {
            return res.status(404).json({ notFoundMessage: `No se encontraron fechas entre ${start} y ${end}` });
        }

        const deletedDates = await DeletedDate.bulkCreate(datesToDelete.map(date => ({
            phone_number: date.phone_number,
            owner: date.owner,
            person_who_booked: date.person_who_booked,
            date: date.date,
            custom_message: date.custom_message,
            email: date.email
        }))); 

        await BookedDate.destroy({
            where: {
                date: {
                    [Op.between]: [start, end]
                }
            }
        });

        return res.status(201).json({ successMessage: `Se han eliminado ${datesCount} fechas con el rango proporcionado, inicio: ${start} fin: ${end}` });
    } catch (error) {
        return res.status(500).json({ errorMessage: `Internal Server Error: ${error}` });
    }
});


// Route to see all of the deleted dates.
app.get('/dates/all-deleted-dates', isAuthenticated, async(req, res) => {
    try {
        
        const allDeletedDates = await DeletedDate.findAll({
            order: [['date', 'ASC']],
        });
        if (allDeletedDates.length === 0) {
            return res.status(404).json({noDeletedDatesFound: 'No deleted dates found'});
        };

        res.json(allDeletedDates);

    } catch (error) {
        res.status(500).json(`Internal Server Error`)
    }
});

// filters by apartado higher or lower.
app.get('/book/apartado/biggerthan/:amount', isAuthenticated, async(req, res) => {});

app.get('/book/apartado/lessthan/:amount', isAuthenticated, async(req, res) => {});

// here will go a route or routes to combine many filters together at once and without needing to provide them all in order
// for this route to work.

// ALL NEWSLETTER ROUTES GO HERE.
app.get('/newsletter/all-emails', isAuthenticated, async(req, res) => { // only admins can access this.
    try {
        
        const allNewsletterEmails = await NewsLetter.findAll();

        if (allNewsletterEmails.length === 0) {
            return res.status(404).json({message: 'No newsletter emails found', noNewsletterEmailsFound: true})
        };

        res.json(allNewsletterEmails);

    } catch (error) {
        res.status(500).json('Internal Server Error')
    };
});

// this route does NOT use the isAuthenticated middleware
// this route does NOT use the isAuthenticated middleware
app.post('/newsletter/email', async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json('Missing email');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ invalidEmailFormat: true });
    }

    try {

        const checkEmail = await NewsLetter.findOne({
            where: {
                email: email
            }
        });

        if (checkEmail) {
            return res.status(400).json({ emailAlreadyAdded: 'Email is already added' });
        }

        await NewsLetter.create({ email });

        res.status(201).json('email added successfully to the newsletter');

    } catch (error) {
        console.error(error);
        res.status(500).json('Internal Server Error');
    }
});


// route to email all the newsletter users marketing emails.
app.post('/newsletter/email-all-users', async(req, res) => {});

sequelize.sync({ force: false }).then(() => {
    app.listen(process.env.PORT || PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
});




//module.exports = router;






/**
 changes:
 1: no real deletio anymore
 2: stop brute force attacks
 3: Email and Owner tables
 4: JWTS
 5: email confirmation on signup and proper validation of it.
 6: deleting and adding emails, DONE PROPERLY.
 7: password recovery functionality, DONE RIGHT.    
 8: 
 9: a few tests to ensure everything works right away.


 front end:
 1: Material UI 5
 2: Landing Page styled fine.
 3: Are you sure type of button showing up before doing 'deletions', ETC.
 
 */

 