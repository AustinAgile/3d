// app.js
const express = require('express');
const hal = require('express-hal');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const view = require('./routes/view');
const data = require('./routes/data');
const topics = require('./routes/topics');
const cdn = require('./routes/cdn');
//const api = require('./routes/api');

const app = express();

//app.use(fileUpload());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(cookieParser());
app.use(hal.middleware);

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//app.use(express.static(path.join(__dirname, 'public')));

app.use('/view', view);
app.use('/data', data);
app.use('/topics', topics);
app.use('/cdn', cdn);
//app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.send();
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send();
});

//var consul = require('consul')();

//consul.agent.service.register(
//	{
//		name: 'TopicAnalysis',
//		port: 3000,
//		http: "xyz"
//	},
//	function(err) {
//		if (err) {
//			console.log("Failed to register with consul");
//			throw err;
//		}
//		console.log("Registered with consul");
//	}
//);

//process.on('SIGINT', function() {
//	consul.agent.service.deregister('TopicAnalysis', function(err) {
//		if (err) {
//			console.log("Failed to deregistered with consul");
//			throw err;
//		}
//		console.log("Deregistered with consul");
//		process.exit();
//	});
//});

module.exports = app; 