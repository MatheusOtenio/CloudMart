import OpenAI from "openai";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { Readable } from "stream";
import pkg from "@smithy/eventstream-codec";

const { EventStreamCodec } = pkg;
import dotenv from "dotenv";
import { deleteOrder, getOrderById, cancelOrder } from "./orderService.js";

dotenv.config();

const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: "us-east-1",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const AGENT_ID = process.env.BEDROCK_AGENT_ID;
const AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS_ID;

const deleteOrderFunction = {
  name: "delete_order",
  description: "Delete an order by order ID",
  parameters: {
    type: "object",
    properties: {
      orderId: {
        type: "string",
        description: "The ID of the order to be deleted",
      },
    },
    required: ["orderId"],
  },
};

const cancelOrderFunction = {
  name: "cancel_order",
  description: "Cancel an order by changing its status to 'canceled'",
  parameters: {
    type: "object",
    properties: {
      orderId: {
        type: "string",
        description: "The ID of the order to be canceled",
      },
    },
    required: ["orderId"],
  },
};

// OpenAI Functions

export const createOpenAIConversation = async () => {
  const thread = await openai.beta.threads.create();
  return thread.id;
};

export const sendOpenAIMessage = async (threadId, message) => {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
    tools: [
      { type: "function", function: deleteOrderFunction },
      { type: "function", function: cancelOrderFunction },
    ],
  });

  let runStatus;
  do {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

    if (runStatus.status === "requires_action") {
      const toolCalls =
        runStatus.required_action.submit_tool_outputs.tool_calls;
      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        const { orderId } = JSON.parse(toolCall.function.arguments);
        let result;

        try {
          const order = await getOrderById(orderId);
          if (!order) {
            result = `Order with ID ${orderId} does not exist.`;
          } else if (toolCall.function.name === "delete_order") {
            await deleteOrder(orderId);
            result = `Order ${orderId} has been successfully deleted.`;
          } else if (toolCall.function.name === "cancel_order") {
            const updatedOrder = await cancelOrder(orderId);
            result = `Order ${orderId} has been successfully canceled. New status: ${updatedOrder.status}`;
          }
        } catch (error) {
          console.error(`Error processing order ${orderId}:`, error);
          result = `An error occurred while processing the order: ${error.message}`;
        }

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: result,
        });
      }

      if (toolOutputs.length > 0) {
        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: toolOutputs,
        });
      }
    }
  } while (runStatus.status !== "completed" && runStatus.status !== "failed");

  if (runStatus.status === "failed") {
    console.error("Run failed:", runStatus.last_error);
    throw new Error("Failed to process the message");
  }

  // Retrieve the assistant's response
  const messages = await openai.beta.threads.messages.list(threadId);
  const assistantMessages = messages.data.filter(
    (msg) => msg.role === "assistant"
  );

  if (assistantMessages.length === 0) {
    throw new Error("No response from assistant");
  }

  return assistantMessages[0].content[0].text.value;
};
// Bedrock Functions

export const createBedrockConversation = async () => {
  return Date.now().toString(); // Simple session ID for now
};
export const sendBedrockMessage = async (sessionId, message) => {
  const params = {
    agentId: AGENT_ID,
    agentAliasId: AGENT_ALIAS_ID,
    sessionId: sessionId,
    inputText: message,
  };

  try {
    console.log(
      "Sending request to Bedrock Agent:",
      JSON.stringify(params, null, 2)
    );
    const command = new InvokeAgentCommand(params);
    const response = await bedrockAgentClient.send(command);

    console.log(
      "Raw response from Bedrock Agent:",
      JSON.stringify(response, null, 2)
    );

    if (
      !response.completion ||
      !response.completion.options ||
      !response.completion.options.messageStream
    ) {
      console.warn("Received empty or unexpected response from Bedrock Agent");
      return "I'm sorry, but I couldn't generate a response at the moment. Please try again later.";
    }

    // Process the messageStream
    const messageStream = response.completion.options.messageStream;
    const stream = Readable.from(messageStream);

    let fullMessage = "";
    for await (const chunk of stream) {
      console.log("Raw chunk:", JSON.stringify(chunk, null, 2));

      if (chunk && typeof chunk === "object" && chunk.body) {
        // Convert the body object to a Buffer
        const bodyBuffer = Buffer.from(Object.values(chunk.body));
        const bodyString = bodyBuffer.toString("utf-8");

        try {
          const bodyJson = JSON.parse(bodyString);
          if (bodyJson.bytes) {
            const decodedText = Buffer.from(bodyJson.bytes, "base64").toString(
              "utf-8"
            );
            fullMessage += decodedText;
            console.log("Decoded text:", decodedText);
          }
        } catch (error) {
          console.log("Error parsing body JSON:", error);
          console.log("Raw body string:", bodyString);
        }
      } else {
        console.log("Unexpected chunk type:", typeof chunk, chunk);
      }
    }

    console.log("Final full message:", fullMessage);

    if (fullMessage) {
      return fullMessage;
    } else {
      return "I'm sorry, but I couldn't generate a response at the moment. Please try again later.";
    }
  } catch (error) {
    console.error("Error invoking Bedrock Agent:", error);
    throw new Error(`Failed to process the message: ${error.message}`);
  }
};

export async function populateProductsTable() {
  // Implementation to populate the DynamoDB table with sample data
  // This would be similar to what was in the PopulateProductsTableFunction
}
