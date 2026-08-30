import express from "express";
import cors from "cors";
<<<<<<< HEAD
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));

app.use(express.json())

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/users", userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
=======
import userRoutes from "./routes/users.js";

const app = express();

app.use(cors());

app.use(express.json())

app.use("/users", userRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
>>>>>>> e83bc52036a7d5cd97603b0ef054cfb99c08dc14
