require('dotenv').config()
const BitcoinClient = require('bitcoin-core');
const AWS = require("aws-sdk");

const logger = require('./logger');
const MetricsClient = require('./metrics');
const metricsClient = new MetricsClient();

AWS.config.update({
  region: "us-east-1",
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.AWS_DYNAMO_TABLE_NAME;

const network = 'mainnet';
// const network = 'testnet';
const client = new BitcoinClient({
  network,
  username: process.env.BITCOIN_RPC_USER,
  password: process.env.BITCOIN_RPC_PASSWORD,
});

const ionGenesisBlock = 667000;
const ionSidetreePrefix = 'ion:';

const getLatestIonTransactionHeight = async () => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'network = :network',
    ExpressionAttributeValues: {
      ':network': 'mainnet'
    },
    // Descending order of block height (most recent transaction first)
    ScanIndexForward: false,
    Limit: 1,
  };
  const record = await docClient.query(params).promise();
  if (!record || !record.Items || record.Items.length === 0) {
    return 0;
  }
  const blockHeight = record.Items[0].blockHeight;
  return blockHeight
};

(async () => {
  const blockchainInfo = await client.getBlockchainInfo();
  await metricsClient.gauge({ label: "ion_best_block", value: blockchainInfo.blocks })
  const latestTransactionHeight = await getLatestIonTransactionHeight();
  logger.info(`latest ion transaction is at: ${latestTransactionHeight}`);
  let blockHash = blockchainInfo.bestblockhash
  let block = await client.getBlock(blockHash, 2);
  while (block.height >= ionGenesisBlock && block.height >= latestTransactionHeight) {
    logger.info(`processing block ${block.height}`)
    const txs = block.tx;
    for (let i = 0; i < txs.length; i += 1) {
      const tx = txs[i];
      const outputs = tx.vout;
      for (const output of outputs) {
        const asm = output.scriptPubKey.asm;
        const hexDataMatches = asm.match(/\s*OP_RETURN ([0-9a-fA-F]+)$/);
        if (hexDataMatches && hexDataMatches.length !== 0) {
          const data = Buffer.from(hexDataMatches[1], 'hex').toString();
          if (data.startsWith(ionSidetreePrefix)) {
            const data = {
              network,
              txHash: tx.hash,
              blockHash: block.hash,
              blockHeight: block.height,
              blockTime: block.time,
              blockMedianTime: block.mediantime,
              outputHex: output.scriptPubKey.hex,
            }
            const params = {
              TableName: tableName,
              Item: data
            };
            await docClient.put(params).promise();
            logger.info(`found ${tx.hash} in block ${block.height}`)
          }
        }
      }
    }
    blockHash = block.previousblockhash;
    block = await client.getBlock(blockHash, 2);
  }
  await metricsClient.push();
})()
