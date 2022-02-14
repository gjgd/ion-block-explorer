const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.AWS_DYNAMO_TABLE_NAME;

const getLatestIonTransactionHeight = async () => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'network = :network',
    ExpressionAttributeValues: {
      ':network': 'mainnet',
    },
    // Descending order of block height (most recent transaction first)
    ScanIndexForward: false,
    Limit: 1,
  };
  const record = await docClient.query(params).promise();
  if (!record || !record.Items || record.Items.length === 0) {
    return 0;
  }
  const { blockHeight } = record.Items[0];
  return blockHeight;
};

const updateDb = async (data) => {
  const params = {
    TableName: tableName,
    Item: data,
  };
  await docClient.put(params).promise();
};

module.exports = {
  getLatestIonTransactionHeight,
  updateDb,
};
