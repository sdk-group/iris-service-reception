module.exports = {
  entity: 'Ticket',
  group: [{
    field: '@id',
    method: 'enum'
  }],
  params: {
    'active': {
      aggregator: "sum",
      filter: ['hasEventProcessing OR hasEventCall', '!hasEventClose']
    }
  }
};