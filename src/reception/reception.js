'use strict'

let emitter = require("global-queue");
let patchwerk = require('patchwerk')(emitter);

let TABLE_TEMPLATE = require('./service-info-template.js');
let ACTIVE_TICKETS_TEMPLATE = require('./active-tickets-template.js');


class Reception {
	constructor() {
		this.emitter = emitter;
		//@FIXIT: make solid concept
		this.cached_service_info = {};
		this.cached_workstation_info = {};
		this.cache_ttl = 15000;
		this.zones = {};
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
	getNow() {
		return 'now';
	}
	getTodayStats(params, template) {

		template.interval = params.date ? [params.date, params.date] : this.getNow();

		template.department = params.department;

		return this.emitter.addTask('reports', {
			_action: 'get-table',
			table: template
		});
	}
	actionServiceDetails(params) {
		let services = params.service ? _.castArray(params.service) : [];
		let condition;
		if (_.isEmpty(services)) {
			condition = false;
		} else {
			condition = services.length > 1 ? 'service in ' + services.join(',') : 'service = ' + services[0];
		}
		let first_name = _.head(params.param_names)

		let picked = _.chain(TABLE_TEMPLATE.params)
			.pick(first_name)
			.cloneDeep()
			.mapValues(param => {
				param.meta = 'all';
				!!condition && param.filter.push(condition);
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
	actionServiceInfo(params) {
			//@FIXIT: event model here
			let now = Date.now();
			let department = params.department;
			let timestamp = _.get(this.cached_service_info, [department, 'timestamp']) || 0;

			if (now - timestamp < this.cache_ttl) {
				return _.get(this.cached_service_info, [department, 'value']);
			}

			let stats = this.getTodayStats(params, TABLE_TEMPLATE);
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
					_.set(this.cached_service_info, [department, 'timestamp'], Date.now());
					_.set(this.cached_service_info, [department, 'value'], result);

					return result;
				})

		}
		//@WARNING: rework it
	_getWorkstationInfo(params) {
		let requests = {
			active_tickets: this.getTodayStats(params, ACTIVE_TICKETS_TEMPLATE),
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

	actionQueryTickets(query) {
		if (query.field == '@id') return this.getSingleTicket(query.text);

		let params = {
			department: query.department
		};

		if (_.isString(query.date)) {
			params.date = query.date;
		}

		let template = {
			entity: 'Ticket',
			params: {
				tickets: {
					meta: "all",
					aggregator: "count"
				}
			}
		};

		template.params.tickets.filter = this.computeFilter(query);
		template.params.tickets.transform = this.computeTransform(query);

		let path = ['nogroup', 'tickets', 'meta'];

		return this.getTodayStats(params, template).then(q => _.get(q, path))
	}
	computeFilter(query) {
		let filter = [];
		if (query.field != 'service' && query.text) filter = [`${query.field} contains ${query.text}`];
		if (query.field == 'service' && query.text) filter = [`${query.field} in ${query.text}`];

		if (query.field == 'session') filter.push('pack_member = 1');
		if (query.field == 'allInfoFields') filter = [`userInfoString contains ${query.text}`];

		return filter;
	}
	computeTransform(query) {
		let transform = [];

		if (query.field == 'allInfoFields') transform.push('concatInfoFields');

		return transform;
	}
	getSingleTicket(id) {
		return this.emitter.addTask('ticket', {
			_action: 'by-id',
			ticket: id
		});
	}

	//@WARNING: rework it
	actionWorkstationInfo(params) {
		let now = Date.now();
		let department = params.department;
		let timestamp = _.get(this.cached_workstation_info, [department, 'timestamp']) || 0;

		if (now - timestamp < this.cache_ttl) {
			return _.get(this.cached_workstation_info, [department, 'workstations']);
		}

		return this._getWorkstationInfo(params).then(workstations => {
			_.set(this.cached_workstation_info, [department, 'workstations'], workstations);

			return workstations;
		});
	}

}

module.exports = Reception;
