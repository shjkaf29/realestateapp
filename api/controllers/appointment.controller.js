// api/controllers/appointment.controller.js
import prisma from "../lib/prisma.js";

export const bookAppointment = async (req, res) => {
  const { agentId, date } = req.body;
  const customerId = req.user.id; // assuming you have auth middleware

  try {
    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        agentId,
        date: new Date(date),
      },
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Failed to book appointment" });
  }
};

export const getAgentAppointments = async (req, res) => {
  const agentId = req.user.id;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { agentId },
      include: { customer: true },
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

export const acceptAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: "accepted" },
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Failed to accept appointment" });
  }
};