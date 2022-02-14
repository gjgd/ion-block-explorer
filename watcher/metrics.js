const { Gauge, Pushgateway } = require('prom-client');
const logger = require('./logger');

class MetricsClient {
  constructor(pushgatewayUrl = 'http://localhost:9091') {
    this.jobName = 'ion-watcher';
    this.pushgatewayUrl = pushgatewayUrl;
    this.pushgateway = new Pushgateway(pushgatewayUrl);
    this.gauges = {};
  }

  getGauge(name, params = {}) {
    if (!(name in this.gauges)) {
      this.gauges[name] = new Gauge({
        name,
        help: name,
        labelNames: Object.keys(params),
      });
    }
    return this.gauges[name];
  }

  gauge({ name, value, ...labels }) {
    const gauge = this.getGauge(name, labels);
    gauge.labels(labels).set(value);
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

module.exports = new MetricsClient();
