'use strict'

let emitter = require("global-queue");
let patchwerk = require('patchwerk')(emitter);

let table_template = require('./service-info-template.js');
let active_tickets = require('./active-tickets-template.js');


class Reception {
	constructor() {
		this.emitter = emitter;
		//@FIXIT: make solid concept
		this.cached_service_info = {};
		this.cache_ttl = 15000;
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
		//@FIXIT: event model here
		let now = Date.now();
		let department = params.department;
		let timestamp = _.get(this.cached_service_info, [department, 'timestamp']) || 0;

		if (now - timestamp < this.cache_ttl) {
			return _.get(this.cached_service_info, [department, 'value']);
		}

		let stats = this.getTodayStats(params, table_template);
		let available = this.emitter.addTask('prebook', {
			_action: 'service-stats',
			organization: params.department
		});

		return Promise.props({
				stats: stats,
				available: available
			})
			.then((data) => {
				let result = data.stats;

				_.forEach(data.available, (param, service) => {
					let key = service + '--enum-service';
					_.set(result, [key, 'live-slots'], param.live_slots_count);
					_.set(result, [key, 'prebook-slots'], param.prebook_slots_count);
				});

				//@FIXIT: event model here
				this.cached_service_info[department] = {
					timestamp: Date.now(),
					value: result
				};

				return result;
			})

	}
	actionServiceDetails(params) {
		let services = params.service ? _.castArray(params.service) : [];
		let conditions = _.map(services, service => 'service = ' + service);
		let first_name = _.head(params.param_names)

		let picked = _.chain(table_template.params)
			.pick(first_name)
			.cloneDeep()
			.mapValues(param => {
				param.meta = ['@id', 'label', 'service', 'user_info'];
				param.filter = _.concat(conditions, param.filter);
				return param;
			})
			.value();

		let template = {
			entity: 'Ticket',
			params: picked
		};

		return this.getTodayStats(params, template)
			.then(response => _.get(response, ['nogroup', first_name, 'meta']))
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

		return Promise.props(requests)
			.then(data => {
				let workstations = _.transform(data.workstations, (acc, ws) => {
					acc.push(_.pick(ws, ['id', 'label', 'occupied_by', 'provides', 'state']));
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
