# ION Block Explorer watcher

Scans the bitcoin chain and looks for Sidetree transactions.

Needs a bitcoin node running

## Config

Needs an `.env` file with the following config

```bash
BITCOIN_RPC_USER=
BITCOIN_RPC_PASSWORD=
AWS_DYNAMO_TABLE_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

## Setup Watcher

Add the following line to your `bitcoin.conf` file

```
blocknotify=<absolute-path-to-project/ion-block-explorer/watcher/scanBlocks.sh
```

This will trigger the scanBlocks hook that watches for ion transactions every time a new block is found
