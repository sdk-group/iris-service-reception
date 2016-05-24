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
		filter: ['hasEventRegister OR hasEventActive']
	}, {
		id: "issued-tickets-services",
		key: "service_count",
		aggregator: "sum",
		filter: ['hasEventRegister OR hasEventActive']
	}, {
		id: "in-room",
		aggregator: "count",
		filter: ['hasEventRegister OR hasEventActive', '!hasEventClose']
	}, {
		id: "in-room-waiting",
		aggregator: "count",
		filter: ['hasEventRegister OR hasEventActive', '!hasEventCall', '!hasEventClose']
	}, {
		id: "in-room-processing",
		aggregator: "count",
		filter: ['hasEventProcessing', '!hasEventClose']
	}, {
		id: "in-room-postponed",
		aggregator: "count",
		filter: ['hasEventPostponed', '!hasEventClose']
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
		filter: ['hasEventActive']
	}]
};
