var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname , 'public')));
app.use('/', router);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {layout: false});

// Uncaught exception handler
process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
});

console.log("Web server has started.\n Please log on http://127.0.0.1:3001/");

app.listen(3001);
