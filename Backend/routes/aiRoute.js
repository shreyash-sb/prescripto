import express from "express";
import { chatWithAI } from "../controllers/aiController.js";

const aiRouter = express.Router();

// Simple AI Chat Assistant Endpoint (Handles public info & authenticated user queries)
aiRouter.post("/chat", chatWithAI);

export default aiRouter;
