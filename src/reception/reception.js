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
  getTodayStats(params, template) {
    let now = moment().format();

    table_template.interval = [now, now];
    table_template.department = params.department;

    return this.emitter.addTask('reports', {
      _action: 'get-table',
      table: template
    });

  }
  actionServiceInfo(params) {
    return this.getTodayStats(params, table_template)
  }
  actionWorkstationInfo(params) {

    let requests = {
      active_tickets: this.getTodayStats(params, active_tickets),
      workstations: patchwerk.get('Workstation', {
        department: params.department
      })
    };

    return Promise.props(requests).then(data => {
      let workstations = data.workstations;

      _.forEach(data.active_tickets, ticket => {
        let dest = ticket.destination;
        let owner = _.find(workstations, ['id', dest]);
        owner.current_ticket = ticket;
      });

      return workstations;
    });
  }
}

module.exports = Reception;