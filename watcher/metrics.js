
const { Gauge, Pushgateway } = require('prom-client');

const gauge = new Gauge({ name: 'random_value', help: 'a random value pushed every time a bitcoin block comes out' });

const localPushgateway = new Pushgateway()

const main = async () => {
    gauge.set(Math.random())
    const { resp, body } = await localPushgateway.push({ jobName: `test` });
    console.log(body)
    await new Promise((resolve) => setTimeout(resolve, 10000))
}

class MetricsClient {
  constructor(pushgatewayUrl =  "http://localhost:9091") {
    this.jobName = "ion-watcher";
    this.pushgatewayUrl = pushgatewayUrl;
    this.pushgateway = new Pushgateway(pushgatewayUrl);
  }

  gauge({ label, value }) {
    const gauge = new Gauge({
      name: label,
      help: label,
    })
    gauge.set(value);
    return this.pushgateway.push({ jobName: this.jobName })
  }
}

module.exports = MetricsClient;
