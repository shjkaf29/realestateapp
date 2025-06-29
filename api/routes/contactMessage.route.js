import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
  sendContactMessage, 
  getAgentMessages, 
  markMessageAsRead, 
  deleteMessage 
} from "../controllers/contactMessage.controller.js";

const router = express.Router();

router.post("/send", verifyToken, sendContactMessage);
router.get("/agent", verifyToken, getAgentMessages);
router.patch("/:messageId/read", verifyToken, markMessageAsRead);
router.delete("/:messageId", verifyToken, deleteMessage);

export default router;
