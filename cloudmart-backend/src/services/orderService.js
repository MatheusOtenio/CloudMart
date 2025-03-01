
import pkg from 'aws-sdk';
const { DynamoDB } = pkg;
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const TABLE_NAME = 'cloudmart-orders';

export const createOrder = async (order) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...order,
      id:uuidv4().split('-')[0],
      createdAt: new Date().toISOString()
    }
  };

  await dynamoDb.put(params).promise();
  return params.Item;
};

export const getAllOrders = async () => {
  const params = {
    TableName: TABLE_NAME
  };

  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

export const getOrderById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  const result = await dynamoDb.get(params).promise();
  return result.Item;
};

export const getOrdersByUserEmail = async (email) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userEmail = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };

  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

export const updateOrder = async (id, updates) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': updates.status
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
};

export const deleteOrder = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  await dynamoDb.delete(params).promise();
};


export const cancelOrder = async (orderId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id: orderId },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'Canceled',
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
};