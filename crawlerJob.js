var schedule = require('node-schedule');

schedule.scheduleJob('0 0 0 * * 1', function() {
	var crawler = require('./crawler');

	console.log('Update Started!');
});