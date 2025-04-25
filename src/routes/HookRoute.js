import express from "express";
import { handleWebhook } from "../controllers/HookController.js";
const router = express.Router();

// Route để xử lý webhook từ Dialogflow
router.post("/webhook", handleWebhook);

export default router;