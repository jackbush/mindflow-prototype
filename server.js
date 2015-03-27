'use strict';

// module dependencies
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
  neurosky = require('node-neurosky');

// MAIN APPLICATION ENTRY FILE

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Init the express application
var app = require('./config/express')(db);

var client = neurosky.createClient({
  appName:'NodeNeuroSky',
  appKey:'0fc4141b4b45c675cc8d3a765b8d71c5bde9390'
});

// ERROR HANDLING FOR WHEN CLIENT IS NOT CONNECTED
// NEEDS IMPROVEMENT

try {
  client.connect();
} catch(e) {
  console.log(e);
}

// SOCKET

var io = app.get('socketio');

io.on('connect', function(socket) {
  client.on('data',function(data) {
    socket.emit('eeg', data);
  });
});

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.get('server').listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);

