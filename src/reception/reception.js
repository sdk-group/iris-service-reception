'use strict'

let emitter = require("global-queue");
let patchwerk = require('patchwerk')(emitter);

let table_template = require('./service-info-template.js');
let active_tickets = require('./active-tickets-template.js');

class Reception {
	constructor() {
		this.emitter = emitter;
	}
	init(config) {}
	launch() {
		return Promise.resolve(true);
	}
	actionReady() {
		return Promise.resolve(true);
	}
	actionBootstrap() {
		console.log('Reception');
		return Promise.resolve(true);
	}
	getTodayStats(params, template) {
		let now = moment().format();

		template.interval = [now, now];
		template.department = params.department;

		return this.emitter.addTask('reports', {
			_action: 'get-table',
			table: template
		});
	}
	actionServiceInfo(params) {
		return this.getTodayStats(params, table_template)
	}
	actionWorkstationInfo(params) {
		// return patchwerk.get('WorkstationCache', {
		//   department: params.department
		// });
		let requests = {
			active_tickets: this.getTodayStats(params, active_tickets),
			workstations: patchwerk.get('Workstation', {
				department: params.department,
				counter: '*'
			})
		};

		return Promise.props(requests).then(data => {
			let workstations = _.transform(data.workstations, (acc, ws) => {
				acc.push(_.pick(ws, ['id', 'label', 'occupied_by', 'provides']));
			}, []) || [];
			// let workstations = data.workstations || [];

			_.forEach(data.active_tickets, ticket => {
				let meta = _.head(ticket.active.meta);
				let dest = meta.destination;

				let owner = _.find(workstations, ['id', dest]);
				if (owner) owner.current_ticket = meta;
			});

			return workstations;
		});
	}
}

module.exports = Reception;
