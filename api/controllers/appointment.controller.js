// api/controllers/appointment.controller.js
import prisma from "../lib/prisma.js";

export const bookAppointment = async (req, res) => {
  const { agentId, postId, date, notes } = req.body;
  const customerId = req.userId;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        agentId,
        postId,
        date: new Date(date),
        notes,
      },
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Failed to book appointment" });
  }
};

export const getAgentAppointments = async (req, res) => {
  const agentId = req.userId;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { agentId },
      include: {
        customer: true,
        post: {
          include: {
            postDetail: true,
          },
        },
      },
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

export const getUserAppointments = async (req, res) => {
  const userId = req.userId;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { customerId: userId },
      include: {
        post: {
          include: {
            postDetail: true,
            user: {
              select: {
                username: true,
                avatar: true,
                id: true,
              },
            },
          },
        },
      },
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: "rejected" },
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
};