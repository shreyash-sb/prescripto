import jwt from "jsonwebtoken";
import { processAIChat } from "../services/ai/aiAgent.js";

/**
 * Handle AI Assistant Chat Request
 * POST /api/ai/chat
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message prompt",
      });
    }

    // Optional user token extraction to support both public visitors and authenticated patients
    let userId = null;
    const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_long_random_jwt_secret_key_here"
        );
        userId = decoded.id || decoded._id;
      } catch (tokenErr) {
        // Invalid or expired token, continue as unauthenticated visitor
        userId = null;
      }
    }

    const result = await processAIChat(
      message,
      Array.isArray(conversationHistory) ? conversationHistory : [],
      userId
    );

    return res.status(200).json({
      success: true,
      response: result.response,
      source: result.source,
    });
  } catch (error) {
    console.error("AI Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your AI request. Please try again.",
      response: "I apologize, but I encountered a temporary error. Please try asking again in a moment.",
    });
  }
};

export default {
  chatWithAI,
};
