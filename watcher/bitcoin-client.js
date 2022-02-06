const retry = require('async-retry');

const BitcoinClient = require('bitcoin-core');

const retries = 1;
const network = process.env.BITCOIN_NETWORK;
const client = new BitcoinClient({
  network,
  username: process.env.BITCOIN_RPC_USER,
  password: process.env.BITCOIN_RPC_PASSWORD,
});

const getBlockchainInfo = async () => {
  return await retry(
    async (bail) => {
      const res = await client.getBlockchainInfo();
      return res;
    },
    { retries }
  );
}

const getBlock = async (blockHash, verbosity) => {
  return await retry(
    async (bail) => {
      const res = await client.getBlock(blockHash, verbosity);
      return res;
    },
    { retries }
  );
}

module.exports = {
  getBlockchainInfo,
  getBlock,
}
