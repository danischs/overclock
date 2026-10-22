import express from "express";
import pool from "../database/database.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    const result = await pool.query(
        "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC",
        [userId]
    );
    res.json(result.rows);
});

router.post("/", async (req, res) => {
    const { user_id, title } = req.body;
    const result = await pool.query(
        "INSERT INTO tasks (user_id, title) VALUES ($1, $2) RETURNING *",
        [user_id, title]
    );
    res.json(result.rows[0]);
});

router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;
    const result = await pool.query(
        `UPDATE tasks
         SET title = COALESCE($1, title), status = COALESCE($2, status), updated_at = now()
         WHERE id = $3
         RETURNING *`,
        [title, status, id]
    );
    res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.json({ message: "Task deleted." });
});

export default router;
