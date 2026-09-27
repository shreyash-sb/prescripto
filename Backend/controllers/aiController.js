import jwt from "jsonwebtoken";
import { processAIChat } from "../services/ai/aiAgent.js";

/**
 * Handle AI Assistant Chat Request
 * POST /api/ai/chat
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(200).json({
        success: true,
        response: "Please enter a message prompt, and I'll be happy to assist you!",
        source: "default",
      });
    }

    // Support token, atoken, dtoken, authorization headers
    let userId = null;
    const token =
      req.headers.token ||
      req.headers.atoken ||
      req.headers.dtoken ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_long_random_jwt_secret_key_here"
        );
        userId = decoded.id || decoded._id;
      } catch (tokenErr) {
        // Continue gracefully as visitor if token verification fails
        userId = null;
      }
    }

    const result = await processAIChat(
      message.trim(),
      Array.isArray(conversationHistory) ? conversationHistory : [],
      userId
    );

    return res.status(200).json({
      success: true,
      response: result.response,
      source: result.source || "gemini-hybrid",
    });
  } catch (error) {
    console.error("AI Controller Error:", error);
    return res.status(200).json({
      success: true,
      response:
        "Hello! I am your Prescripto Assistant. I can help you find verified doctors, check live availability, understand refund rules, or explain healthcare services. How can I help you today?",
      source: "fallback",
    });
  }
};

export default {
  chatWithAI,
};
