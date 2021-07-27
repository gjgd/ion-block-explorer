'use strict';

const express = require('express');
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

const app = express();
const docClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send('Hi');
});

app.get('/transactions', async (req, res) => {
  const { blockHeight, from } = req.query;
  console.log({ blockHeight, from })
  if (blockHeight) {
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        network: 'mainnet',
        blockHeight: Number(blockHeight),
      },
    };
    const record = await docClient.get(params).promise();
    if (record.Item) {
      res.status(200).send(record.Item);
    } else {
      res.sendStatus(404);
    }
  } else if (from) {
  }
});

module.exports = app;
