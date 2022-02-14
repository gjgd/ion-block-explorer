const retry = require('async-retry');
const BitcoinClient = require('bitcoin-core');
const logger = require('./logger');
const MetricsClient = require('./metrics');

const retries = 0;
const network = process.env.BITCOIN_NETWORK;
const bitcoinClient = new BitcoinClient({
  network,
  username: process.env.BITCOIN_RPC_USER,
  password: process.env.BITCOIN_RPC_PASSWORD,
});
const metricsClient = new MetricsClient();

const retryBitcoinFunction = async (bitcoinFunction, ...args) => {
  try {
    const res = await retry(
      async (bail, attemptNumber) => {
        logger.debug(
          `calling ${bitcoinFunction} with args ${args} and attemptNumber ${attemptNumber}`
        );
        return bitcoinClient[bitcoinFunction](...args);
      },
      { retries }
    );
    return res;
  } catch (error) {
    logger.error(`[retryBitcoinFunction]: ${error}`);
    // console.log(error.name, error.message, Date.now());
    // TODO: add more labels
    await metricsClient.gauge({
      label: 'bitcoin_client_error',
      value: Date.now(),
    });
    // TODO: refactor pushAdd
    await metricsClient.pushAdd();
    throw error;
  }
};

const getBlockchainInfo = async () => {
  return retryBitcoinFunction('getBlockchainInfo');
};

const getBlock = async (blockHash, verbosity) => {
  return retryBitcoinFunction('getBlock', blockHash, verbosity);
};

module.exports = {
  getBlockchainInfo,
  getBlock,
};
