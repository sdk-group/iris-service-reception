'use strict'

let emitter = require("global-queue");

let table_template = require('./service-info-template.js');

class Reception {
  constructor() {
    this.emitter = emitter;
  }
  init(config) {

  }
  launch() {
    return Promise.resolve(true);
  }
  actionServiceInfo(params) {
    let now = moment().format();

    table_template.interval = [now, now];
    table_template.department = params.department;

    return this.emitter.addTask('reports', {
      _action: 'get-table',
      table: table_template
    });
  }
  actionWorkstationInfo() {

  }
}

module.exports = Reception;