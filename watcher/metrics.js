const { Gauge, Pushgateway, Counter } = require('prom-client');
const logger = require('./logger');

class MetricsClient {
  constructor(pushgatewayUrl = 'http://localhost:9091') {
    this.jobName = 'ion-watcher';
    this.pushgatewayUrl = pushgatewayUrl;
    this.pushgateway = new Pushgateway(pushgatewayUrl);
    this.gauges = {};
    this.counters = {};
  }

  getGauge(label) {
    if (!(label in this.gauges)) {
      this.gauges[label] = new Gauge({
        name: label,
        help: label,
      });
    }
    return this.gauges[label];
  }

  gauge({ label, value }) {
    const gauge = this.getGauge(label);
    gauge.set(value);
  }

  getCounter(label) {
    if (!(label in this.counters)) {
      this.counters[label] = new Counter({
        name: label,
        help: label,
      });
    }
    return this.counters[label];
  }

  counterInc({ label }) {
    const counter = this.getCounter(label);
    counter.inc();
  }

  async pushAdd() {
    try {
      return await this.pushgateway.pushAdd({ jobName: this.jobName });
    } catch (error) {
      logger.error(
        `Could not pushAdd ${error.message} ${error.code} ${error.stack} `
      );
      return null;
    }
  }
}

module.exports = MetricsClient;
