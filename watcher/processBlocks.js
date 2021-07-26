require('dotenv').config()
const Client = require('bitcoin-core');
const network = 'mainnet';
// const network = 'testnet';

const client = new Client({
  network,
  username: process.env.BITCOIN_RPC_USER,
  password: process.env.BITCOIN_RPC_PASSWORD,
});

const ionGenesisBlock = 667000;
const ionSidetreePrefix = 'ion:';

(async () => {
  const blockchainInfo = await client.getBlockchainInfo();
  let blockHash = blockchainInfo.bestblockhash
  let block = await client.getBlock(blockHash, 2);
  while (block.height >= ionGenesisBlock) {
    console.log(`processing block ${block.height}`)
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
            console.log(JSON.stringify(data, null, 2))
          }
        }
      }
    }
    blockHash = block.previousblockhash;
    block = await client.getBlock(blockHash, 2);
  }
})()
