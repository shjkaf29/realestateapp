import prisma from "../lib/prisma.js";

// Send a contact message to an agent
export const sendContactMessage = async (req, res) => {
  const { recipientId, message, subject, senderName, senderEmail } = req.body;
  const senderId = req.userId; // from auth middleware

  try {
    // Verify the recipient is an agent
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { role: true }
    });

    if (!recipient || recipient.role !== "agent") {
      return res.status(400).json({ message: "Recipient must be an agent!" });
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        senderId,
        recipientId,
        message,
        subject: subject || "Contact from customer",
        senderName,
        senderEmail,
      },
    });

    res.status(201).json(contactMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send message!" });
  }
};

// Get all messages for an agent
export const getAgentMessages = async (req, res) => {
  const agentId = req.userId;

  try {
    // Verify user is an agent
    const user = await prisma.user.findUnique({
      where: { id: agentId },
      select: { role: true }
    });

    if (!user || user.role !== "agent") {
      return res.status(403).json({ message: "Only agents can access messages!" });
    }

    const messages = await prisma.contactMessage.findMany({
      where: { recipientId: agentId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get messages!" });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  const { messageId } = req.params;
  const agentId = req.userId;

  try {
    // Verify the message belongs to this agent
    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.recipientId !== agentId) {
      return res.status(403).json({ message: "Unauthorized!" });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.status(200).json(updatedMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to mark message as read!" });
  }
};

// Delete/clear a message
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const agentId = req.userId;

  try {
    // Verify the message belongs to this agent
    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.recipientId !== agentId) {
      return res.status(403).json({ message: "Unauthorized!" });
    }

    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    res.status(200).json({ message: "Message deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete message!" });
  }
};
