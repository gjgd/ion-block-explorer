# ION Block Explorer watcher

Scans the bitcoin chain and looks for Sidetree transactions.

Needs a bitcoin node running

## Config

```
cp .env.example .env
```

And fill out the values

## Setup Watcher

Add the following line to your `bitcoin.conf` file

```
blocknotify=<absolute-path-to-project/ion-block-explorer/watcher/scanBlocks.sh
```

This will trigger the scanBlocks hook that watches for ion transactions every time a new block is found
