var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const connectDB = require('./db');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var linksRouter = require('./routes/links');
var redirectRouter = require('./routes/redirect');
var authRouter = require('./routes/auth');

var app = express();

connectDB().catch(err => console.error('MongoDB connection failed:', err.message));

app.use(cors({ origin: process.env.CORS_ORIGIN }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/links', linksRouter);
app.use('/s', redirectRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
