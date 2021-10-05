
const { Gauge, Pushgateway } = require('prom-client');

class MetricsClient {
  constructor(pushgatewayUrl =  "http://localhost:9091") {
    this.jobName = "ion-watcher";
    this.pushgatewayUrl = pushgatewayUrl;
    this.pushgateway = new Pushgateway(pushgatewayUrl);
    this.gauges = {};
  }

  getGauge(label) {
    if (!(label in this.gauges)) {
      this.gauges[label] = new Gauge({
        name: label,
        help: label,
      })
    }
    return this.gauges[label]
  }

  gauge({ label, value }) {
    const gauge = this.getGauge(label)
    gauge.set(value);
  }

  push() {
    return this.pushgateway.push({ jobName: this.jobName })
  }
}

module.exports = MetricsClient;
