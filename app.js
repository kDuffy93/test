var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

// import mongoose and db config file
const mongoose = require("mongoose");
const config = require("./config/globals");
const User = require('./models/user');

//import passport and basic strategiy
const passport = require("passport")
const basicStrategy = require('passport-http').BasicStrategy;
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session');

//import routers from routes folder
var indexRouter = require('./routes/index');
var heatMapRouter = require('./routes/api/heatMap');
var viewDataRouter = require('./routes/api/rentalData');
var loginRouter = require('./routes/api/login');
var registerRouter = require('./routes/api/register');


//initialize express 
var app = express();
//Allow CORS from webistes matching the Origin for the methods defined

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    methods: 'GET,POST,PUT,DELETE,HEAD,OPTIONS'
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//defaut setup stuff
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




// initialization of passport middleware for api authentication
// app.use(passport.initialize());


app.use(session({
    secret: 'mesnFrontEndSecret',
    resave: true,
    saveUninitialized: false,
    cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

let authUser = async (user, password, done) => {

    let authenticated_user = awaitUser.findByUsername(user);

    if (authenticated_user.password == password) {
        return done(null, authenticated_user)
    } else {
        console.log("not authenticated");
        return done(null, false);
    }
}

passport.use(new LocalStrategy(authUser));







passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes for api
app.use('/', indexRouter);
app.use('/heatMap', heatMapRouter);
/* app.use('/rentalData', passport.authenticate('basic', { session: false }), viewDataRouter); */
app.use('/rentalData', viewDataRouter);
app.use('/login', loginRouter);




app.use('/register', registerRouter);

// attempt to connect to database
mongoose
    .set('strictQuery', true)
    .connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((message) => {
        console.log("connected to DB Successfully");
    })
    .catch((error) => {
        console.log(`Error while connecting to db! ${error}`);
    });



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
