import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const tableName = "cloudmart-products";

  try {
    let params = {
      TableName: tableName,
      Limit: 100,
      ProjectionExpression: "#n, description, price",
      ExpressionAttributeNames: { "#n": "name" },
    };

    // Check if 'name' parameter is provided
    if (event.parameters && event.parameters.length > 0) {
      const nameParam = event.parameters.find((param) => param.name === "name");
      if (nameParam) {
        params.FilterExpression = "contains(#n, :nameValue)";
        params.ExpressionAttributeValues = { ":nameValue": nameParam.value };
      }
    }

    console.log(
      "Scanning DynamoDB with params:",
      JSON.stringify(params, null, 2)
    );
    const command = new ScanCommand(params);
    const data = await docClient.send(command);
    console.log("DynamoDB scan result:", JSON.stringify(data, null, 2));

    const products = data.Items.map((item) => ({
      name: item.name,
      description: item.description,
      price: item.price,
    }));

    const response = {
      messageVersion: event.messageVersion || "1.0",
      response: {
        actionGroup: event.actionGroup,
        apiPath: event.apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 200,
        responseBody: {
          "application/json": {
            body: JSON.stringify(products),
          },
        },
        sessionAttributes: {},
        promptSessionAttributes: {},
      },
    };

    console.log("Final Lambda response:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("Error:", error);
    const errorResponse = {
      messageVersion: "1.0",
      response: {
        actionGroup: event.actionGroup || "Get-Product-Recommendations",
        apiPath: event.apiPath || "/products",
        httpMethod: event.httpMethod || "GET",
        httpStatusCode: 500,
        responseBody: {
          "application/json": {
            body: JSON.stringify({ error: error.message }),
          },
        },
        sessionAttributes: {},
        promptSessionAttributes: {},
      },
    };
    console.log("Error response:", JSON.stringify(errorResponse, null, 2));
    return errorResponse;
  }
};
