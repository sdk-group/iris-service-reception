'use strict'

let emitter = require("global-queue");

let table_template = require('./service-info-template.js');

class Reception {
	constructor() {
		this.emitter = emitter;
	}
	init(config) {}
	launch() {
		return Promise.resolve(true);
	}
	actionServiceInfo() {
		let now = moment().format();

		table_template.interval = [now, now];
		table_template.department = ['department-1'];

		this.emitter.addTask('reports', {
			_action: 'get-table',
			table: template
		}).then(d => {
			console.log(d);
		});
	}
	actionWorkstationInfo() {

	}
}

module.exports = Reception;
