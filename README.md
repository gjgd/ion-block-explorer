# ION Block Explorer

https://ion-block-explorer.gjgd.xyz/

This project is a simple block explorer that gives information about latest [ION](https://github.com/decentralized-identity/ion) transactions like:

- Block height
- Transaction hash
- Transaction time
- Sidetree anchor hash

## Components

- Block explorer website deployed at https://ion-block-explorer.gjgd.xyz/
- Block explorer API deployed at https://ion-block-explorer-api.gjgd.xyz/transactions
- A watcher service that uses a Bitcoin full node to scan the Bitcoin blockchain, look for Ion transaction and saves them in a database
- A database for storing Ion transactions
