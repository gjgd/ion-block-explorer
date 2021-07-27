'use strict';

const express = require('express');
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

const app = express();
const docClient = new AWS.DynamoDB.DocumentClient();
const pageSize = 20;

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send('Hi');
});

app.get('/transactions/:blockHeight', async (req, res) => {
  const { blockHeight } = req.params;
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
  }
  res.sendStatus(400);
});

app.get('/transactions', async (req, res) => {
  const { from } = req.query;
  if (from) {
    res.status(200).send({ from });
  } else {
    const params = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'network = :network',
      ExpressionAttributeValues: {
        ':network': 'mainnet'
      },
      // Descending order of block height (most recent transaction first)
      ScanIndexForward: false,
      Limit: pageSize,
    };
    const record = await docClient.query(params).promise();
    if (record.Items) {
      res.status(200).send(record.Items);
    } else {
      res.sendStatus(404);
    }
  }
});

module.exports = app;
