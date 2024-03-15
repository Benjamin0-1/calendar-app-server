const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const PORT = 4000;
const viewCount = 0;

// Correct order of middleware
app.use(cors());
app.use(bodyParser.json());

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    store: new session.MemoryStore({
        checkPeriod: 86400000,
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

const handleLogin = (req, res, next) => {
    if (!req.session.user) {
        res.status(401).send('Not authorized')
    }
    next('Authorized');
};

app.use(handleLogin);

const errorHandler = (err, req, res, next) => {
    if (err && err.status) {
        console.log(err.status);
    }
    const newError = new Error('there was an error');
    next(newError);
}

app.get('/', (req, res) => {
    res.send('Root path');
});

app.get('/getcount', (req, res) => {
    req.session.viewCount +=1;
    res.render('index: ', {viewCount: req.session.viewCount})
    res.send(viewCount)
})

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
});

// upload image to it 
// express-session and login/sign up and Database
