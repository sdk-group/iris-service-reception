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
      active_workstations: patchwerk.get('ActionWorkstation', {
        department: params.department
      })
    };

    return Promise.props(requests).then(data => {
      _.forEach(data.active_tickets, ticket => {

      });

      return data.active_workstations;
    });
  }
}

module.exports = Reception;