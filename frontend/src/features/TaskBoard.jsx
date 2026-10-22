import { useState, useEffect } from "react";
import "../styles/TaskBoard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const NEXT = { todo: "doing", doing: "done" };
const PREV = { doing: "todo", done: "doing" };

function TaskBoard({ userId }) {
    const [tasks, setTasks] = useState([]);
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => {
        if (userId) fetchTasks();
    }, [userId]);

    async function fetchTasks() {
        const res = await fetch(`${API_URL}/tasks/${userId}`);
        const data = await res.json();
        setTasks(data);
    }

    async function addTask(e) {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const res = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, title: newTitle.trim() }),
        });
        const task = await res.json();
        setTasks((prev) => [...prev, task]);
        setNewTitle("");
    }

    async function moveTask(id, direction) {
        const task = tasks.find((t) => t.id === id);
        const newStatus = direction === "next" ? NEXT[task.status] : PREV[task.status];
        if (!newStatus) return;
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }

    async function deleteTask(id) {
        await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
        setTasks((prev) => prev.filter((t) => t.id !== id));
    }

    const columns = ["todo", "doing", "done"];
    const labels = { todo: "Todo", doing: "Doing", done: "Done" };

    return (
        <div className="task-board">
            <h2 className="task-board-title">Quest Board</h2>
            <form className="task-add-form" onSubmit={addTask}>
                <input
                    type="text"
                    placeholder="New quest..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <button type="submit">Add</button>
            </form>
            <div className="task-columns">
                {columns.map((col) => (
                    <div className="task-column" key={col}>
                        <h3 className="task-column-title">{labels[col]}</h3>
                        {tasks
                            .filter((t) => t.status === col)
                            .map((task) => (
                                <div className="task-card" key={task.id}>
                                    <span className="task-card-title">{task.title}</span>
                                    <div className="task-card-actions">
                                        {PREV[col] && (
                                            <button onClick={() => moveTask(task.id, "prev")} title="Move back">
                                                ←
                                            </button>
                                        )}
                                        {NEXT[col] && (
                                            <button onClick={() => moveTask(task.id, "next")} title="Move forward">
                                                →
                                            </button>
                                        )}
                                        <button onClick={() => deleteTask(task.id)} title="Delete" className="delete-btn">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TaskBoard;
