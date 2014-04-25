var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//var users = require('./routes/users');
var add = require('./routes/add');

var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'bartagnan');

var DrinkSchema = require('./models/Drink.js').DrinkSchema;
var Drink = db.model('drinks', DrinkSchema);

var PumpSchema = require('./models/Pump.js').PumpSchema;
var Pump = db.model('pumps', PumpSchema);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index(Drink, Pump));
app.get('/add', add.form);
//app.use('/users', users);

//app.post('/drink.json', add.logDrink(Drink));
app.post('/drink.json', add.addDrink(Drink));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.listen(3000);

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
