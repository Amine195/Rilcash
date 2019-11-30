// Import Package
require('dotenv').config();
const path = require('path');
const express = require('express');
const figlet = require('figlet');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const User = require('./models/user');

// Initialize Express App
const app = express();
// Morgan Middleware
app.use(morgan('dev'));

// Moment Middleware
app.locals.moment = require('moment');

// Initialize Connect-mongodb-session
const store = new MongoDBStore({
    uri: process.env.DB_HOST,
    collection: 'sessions',
});

// Initialize CSRF
const csrfProtection = csrf();

// Initialize engine Template
app.engine('ejs', engine);
app.set('views', 'views');
app.set('view engine', 'ejs');

// Import Routing
const showcaseRoutes = require('./routes/showcase');
const authRoutes = require('./routes/auth');
const saleRoutes = require('./routes/sale');
const errorController = require('./controllers/error');

// Initialize BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Public Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/popper.js/dist/umd')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));

// Initialize Express Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
}));

// Using CSRF
app.use(csrfProtection);

// Initialize Connect-flash
app.use(flash());

// Middleware Nonbre users
app.use(async (req, res, next) => {
    const nbrUsers = await User.find().countDocuments();
    res.locals.nbrUsers = nbrUsers;
    next();
});

// Middleware User
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    // eslint-disable-next-line no-underscore-dangle
    User.findById(req.session.user._id).populate('godFather')
        .then((user) => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch((err) => {
            next(new Error(err));
        });
});

// Store Flash MSG
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.errorFM = req.flash('error');
    res.locals.successFM = req.flash('success');
    next();
});

// Initialize Routing
app.use(authRoutes); // authentication
app.use('/showcase', showcaseRoutes); // page static
app.use('/sale', saleRoutes); // Annonce de Vente

// Error Controllers
app.get('/500', errorController.get500);

// Page Not Found Middleware
app.use(errorController.get404);

// Error Middleware
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error',
        isAuthenticated: req.session.isLoggedIn,
    });
});

// Connect Database and Launch Server on Port 3000
figlet('COURTIER-DZ', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
}, (err, result) => {
    if (err) {
        debug(`figlet ${(err)}`);
        return;
    }
    console.log(err || result);
});
mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        debug(`Database Connected in port ${chalk.green.bold('*** 27017 ***')}`);
        app.listen(process.env.PORT, () => {
            debug(`Server Running in port ${chalk.green.bold('***')} ${chalk.green.bold(process.env.PORT)} ${chalk.green.bold('***')}`);
        });
    })
    .catch((err) => {
        debug(`${chalk.red.bold(err)}`);
    });
