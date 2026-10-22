import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import sessionRoutes from "./routes/sessions.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));

app.use(express.json())

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/users", userRoutes);
app.use("/sessions", sessionRoutes);
app.use("/tasks", taskRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));