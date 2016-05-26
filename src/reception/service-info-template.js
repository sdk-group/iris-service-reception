'use strict'

module.exports = {
	entity: 'Ticket',
	group: [{
		field: 'service',
		method: 'enum'
	}],
	params: {
		"issued-tickets": {
			aggregator: "count",
			filter: ['hasEventRegister OR hasEventActivate']
		},
		"issued-tickets-services": {
			key: "service_count",
			aggregator: "sum",
			filter: ['hasEventRegister OR hasEventActivate']
		},
		"in-room": {
			aggregator: "count",
			filter: ['hasEventRegister OR hasEventActivate', '!hasEventClose']
		},
		"in-room-services": {
			key: "service_count",
			aggregator: "sum",
			filter: ['hasEventRegister OR hasEventActivate', '!hasEventClose']
		},
		"waiting": {
			aggregator: "count",
			filter: ['hasEventRegister OR hasEventActivate', '!hasEventCall', '!hasEventClose']
		},
		"waiting-services": {
			key: "service_count",
			aggregator: "sum",
			filter: ['hasEventRegister OR hasEventActivate', '!hasEventCall', '!hasEventClose']
		},
		"processing": {
			aggregator: "count",
			filter: ['hasEventProcessing', '!hasEventClose']
		},
		"processing-services": {
			key: "service_count",
			aggregator: "sum",
			filter: ['hasEventProcessing', '!hasEventClose']
		},
		"postponed": {
			aggregator: "count",
			filter: ['hasEventPostpone', '!hasEventClose']
		},
		"postponed-services": {
			key: "service_count",
			aggregator: "sum",
			filter: ['hasEventPostpone', '!hasEventClose']
		},
		"processed": {
			aggregator: "count",
			filter: ['hasEventClose']
		},
		"processed-services": {
			key: "service_count",
			aggregator: "sum",
			filter: ['hasEventClose']
		},
		"total-live": {
			aggregator: "count",
			filter: ['hasEventRegister']
		},
		"total-prebook": {
			aggregator: "count",
			filter: ['hasEventActivate']
		}
	}
};
