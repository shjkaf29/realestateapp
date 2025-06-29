import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import appointmentRoute from "./routes/appointment.route.js";
import contactMessageRoute from "./routes/contactMessage.route.js";

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[APP] ${req.method} ${req.originalUrl}`);
  console.log(`[APP] Headers:`, req.headers);
  console.log(`[APP] Cookies:`, req.cookies);
  next();
});

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/contact-messages", contactMessageRoute);

app.listen(8800, () => {
  console.log("Server is running!");
});
