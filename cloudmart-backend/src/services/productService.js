// services/productService.js
import pkg from 'aws-sdk';
const { DynamoDB } = pkg;
import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const TABLE_NAME = 'cloudmart-products';

export const createProduct = async (product) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...product,       
      id:uuidv4().split('-')[0],
      createdAt: new Date().toISOString()}
  };

  await dynamoDb.put(params).promise();
  return product;
};

export const getAllProducts = async () => {
  const params = {
    TableName: TABLE_NAME
  }; 

  const result = await dynamoDb.scan(params).promise();

  return result.Items;
};

export const getProductById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  const result = await dynamoDb.get(params).promise();
  return result.Item;
};

export const updateProduct = async (id, updates) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #n = :n, price = :p, image = :i, description = :d',
    ExpressionAttributeNames: {
      '#n': 'name'
    },
    ExpressionAttributeValues: {
      ':n': updates.name,
      ':p': updates.price,
      ':i': updates.image,
      ':d': updates.description
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
};

export const deleteProduct = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  await dynamoDb.delete(params).promise();
};