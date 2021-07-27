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

app.get('/transactions/:blockHeight', async (req, res) => {
  try {
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

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something broke! Check the logs' })
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const { before } = req.query;
    if (before) {
      const params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'network = :network AND blockHeight < :blockHeight',
        ExpressionAttributeValues: {
          ':network': 'mainnet',
          ':blockHeight': Number(before),
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

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something broke! Check the logs' })
  }
});

module.exports = app;
