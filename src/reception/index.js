'use strict'

let events = {
	reception: {}
}

let tasks = [];


module.exports = {
	module: require('./reception.js'),
	name: 'reception',
	permissions: [],
	tasks: tasks,
	exposed: true,
	events: {
		group: 'reception',
		shorthands: events.reception
	}
};