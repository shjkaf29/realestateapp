import { acceptAppointment, bookAppointment, getAgentAppointments } from "../controllers/appointment.controller.js";

// api/routes/appointment.route.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/book", verifyToken, bookAppointment);
router.get("/agent", verifyToken, getAgentAppointments);
router.patch("/:id/accept", verifyToken, acceptAppointment);

export default router;