import express from "express";
import pool from "../database/database.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { user_id, session_type, started_at, ended_at, duration_seconds } = req.body;

    await pool.query(
        `INSERT INTO work_sessions (user_id, session_type, started_at, ended_at, duration_seconds)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, session_type, started_at, ended_at, duration_seconds]
    );

    res.json({ message: "Session saved." });
});

export default router;
