/* eslint-disable no-await-in-loop */
require('dotenv').config();
const { updateDb, getLatestIonTransactionHeight } = require('./aws-client');
const { getBlockchainInfo, getBlock } = require('./bitcoin-client');

const logger = require('./logger');
const metrics = require('./metrics');

const ionGenesisBlock = 667000;
const ionSidetreePrefix = 'ion:';
const network = process.env.BITCOIN_NETWORK;

const main = async () => {
  const blockchainInfo = await getBlockchainInfo();
  const bestBlock = blockchainInfo.blocks;
  const tipOfTheChain = blockchainInfo.headers;
  if (bestBlock !== tipOfTheChain) {
    logger.info(
      `stopping block scanning... not at the tip yet. bestBlock=${bestBlock} tip=${tipOfTheChain}`
    );
    return;
  }
  await metrics.gauge({ name: 'ion_best_block', value: bestBlock });
  const latestTransactionHeight = await getLatestIonTransactionHeight();
  const blockLag = bestBlock - latestTransactionHeight;
  await metrics.gauge({ name: 'ion_block_lag', value: blockLag });
  logger.info(`latest ion transaction is at: ${latestTransactionHeight}`);
  let blockHash = blockchainInfo.bestblockhash;
  let block = await getBlock(blockHash, 2);
  while (
    block.height >= ionGenesisBlock &&
    block.height >= latestTransactionHeight
  ) {
    logger.info(`processing block ${block.height}`);
    const txs = block.tx;
    for (let i = 0; i < txs.length; i += 1) {
      const tx = txs[i];
      const outputs = tx.vout;
      for (let j = 0; j < outputs.length; j += 1) {
        const output = outputs[j];
        const { asm } = output.scriptPubKey;
        const hexDataMatches = asm.match(/\s*OP_RETURN ([0-9a-fA-F]+)$/);
        if (hexDataMatches && hexDataMatches.length !== 0) {
          const data = Buffer.from(hexDataMatches[1], 'hex').toString();
          if (data.startsWith(ionSidetreePrefix)) {
            const sidetreeTransactionData = {
              network,
              txHash: tx.hash,
              blockHash: block.hash,
              blockHeight: block.height,
              blockTime: block.time,
              blockMedianTime: block.mediantime,
              outputHex: output.scriptPubKey.hex,
            };
            await updateDb(sidetreeTransactionData);
            logger.info(`found ${tx.hash} in block ${block.height}`);
          }
        }
      }
    }
    blockHash = block.previousblockhash;
    block = await getBlock(blockHash, 2);
  }
  await metrics.pushAdd();
};

main();
