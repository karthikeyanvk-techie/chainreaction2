// server.js


// set all the dependencies
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT ||3000;

// Passport
var passport = require('passport');
var flash    = require('connect-flash');

// Secure HTTPS
var https = require('https');
var fs = require('fs');

// DATABASE connection
var mysql = require('mysql');
var dbconfig = require('./config/database');

var connection;

function handleDisconnect() {
  connection = mysql.createConnection({  
  host: "us-cdbr-iron-east-01.cleardb.net",  
  user: "b4d87862840d1f",  
  password: "61af38dd"  
}); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// console.log(connection);

connection.query('USE ' + dbconfig.database);


// configuration
// connect to the database
require('./config/passport')(passport, connection); // pass passport and sql connection for configuration

// set up the express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// Set view engine
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'somesecretofprojectswe681passportnodejsgameproject',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Board database
// var board = require('./app/board.js');
// board.connection = this.connection;
// console.log(this.board);

// routes set up
var routing = require('./app/routes')(app, passport); // load our routes and pass in our app and fully configured passport


// ssl/tsl secure key and self-signed certificate generated using openssl
var options = {
	key  : fs.readFileSync('server.key'),
	cert : fs.readFileSync('server.crt')
 };

// Start the server
https.createServer(options, app).listen(port, function (err) {
if (err) {
	return console.log('something bad happened', err)
	}
	console.log(`server is listening on ${port}`)
});


// Set the admin user
var boardObj = require('./app/board');
boardObj.setUserRole("admin", "ADMIN", function(err, data) {

});




