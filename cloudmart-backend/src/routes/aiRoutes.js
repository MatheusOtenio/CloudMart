// routes/aiRoutes.js
import express from "express";
import {
  startOpenAIConversationController,
  sendOpenAIMessageController,
  startBedrockConversationController,
  sendBedrockMessageController,
} from "../controllers/aiController.js";

const router = express.Router();

// OpenAI routes
router.post("/start", startOpenAIConversationController);
router.post("/message", sendOpenAIMessageController);

// Bedrock routes
router.post("/bedrock/start", startBedrockConversationController);
router.post("/bedrock/message", sendBedrockMessageController);

export default router;
