var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var passport = require('passport');
var configAuth = require('./config/auth');

var routes = require('./routes/index'),
    users = require('./routes/users'),
    posts = require('./routes/posts');

var routeAuth = require('./routes/auth');
var app = express();

module.exports = function(app, io) {
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }
  app.locals.moment = require('moment');

  // mongodb connect
  // 아래 DB접속 주소는 꼭 자기 것으로 바꾸세요!
  mongoose.connect('mongodb://mkm4263:cjstk109@ds045054.mongolab.com:45054/mkm4263');
  mongoose.connection.on('error', console.log);

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(methodOverride('_method', {methods: ['POST', 'GET']}));
  var MongoStore = require('connect-mongo')(session);
  app.sessionStore = new MongoStore({mongooseConnection: mongoose.connection});
  app.use(session({
    resave: true,
    key: 'express.sid',
    saveUninitialized: true,
    secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd',
    store: app.sessionStore
  }));


  app.use(flash());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/bower_components',  express.static(path.join(__dirname, '/bower_components')));



  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.flashMessages = req.flash();
    next();
  });

  configAuth(passport);

  app.use('/', routes);
  app.use('/posts', posts);
  app.use('/users', users);
  routeAuth(app, passport);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

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

  return app;
};
