'use strict'

module.exports = {
	entity: 'Ticket',
	group: [{
		field: 'service',
		method: 'enum'
	}],
	params: [{
		id: "issued-tickets",
		aggregator: "count",
		filter: ['hasEventRegister OR hasEventActivate']
	}, {
		id: "issued-tickets-services",
		key: "service_count",
		aggregator: "sum",
		filter: ['hasEventRegister OR hasEventActivate']
	}, {
		id: "in-room",
		aggregator: "count",
		filter: ['hasEventRegister OR hasEventActivate', '!hasEventClose']
	}, {
		id: "in-room-waiting",
		aggregator: "count",
		filter: ['hasEventRegister OR hasEventActivate', '!hasEventCall', '!hasEventClose']
	}, {
		id: "in-room-processing",
		aggregator: "count",
		filter: ['hasEventProcessing', '!hasEventClose']
	}, {
		id: "in-room-postponed",
		aggregator: "count",
		filter: ['hasEventPostpone', '!hasEventClose']
	}, {
		id: "processed",
		aggregator: "count",
		filter: ['hasEventClose']
	}, {
		id: "total-live",
		aggregator: "count",
		filter: ['hasEventRegister']
	}, {
		id: "total-prebook",
		aggregator: "count",
		filter: ['hasEventActivate']
	}]
};
