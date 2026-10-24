import { useState, useEffect } from "react";
import Button from "../components/Button";
import "../styles/TaskBoard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const NEXT = { todo: "doing", doing: "done" };
const PREV = { doing: "todo", done: "doing" };
const COLUMNS = [
    { key: "todo", label: "Todo", code: "Q-01" },
    { key: "doing", label: "Doing", code: "Q-02" },
    { key: "done", label: "Done", code: "Q-03" },
];

function TaskBoard({ userId }) {
    const [tasks, setTasks] = useState([]);
    const [newTitle, setNewTitle] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (userId) fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    async function request(url, options) {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    async function fetchTasks() {
        try {
            setTasks(await request(`${API_URL}/tasks/${userId}`));
            setError("");
        } catch {
            setError("Couldn't load quests. Check that the backend is running.");
        }
    }

    async function addTask(e) {
        e.preventDefault();
        if (!newTitle.trim() || !userId) return;
        try {
            const task = await request(`${API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, title: newTitle.trim() }),
            });
            setTasks((prev) => [...prev, task]);
            setNewTitle("");
            setError("");
        } catch {
            setError("Couldn't add the quest. Try again.");
        }
    }

    async function moveTask(id, direction) {
        const task = tasks.find((t) => t.id === id);
        const newStatus = direction === "next" ? NEXT[task.status] : PREV[task.status];
        if (!newStatus) return;
        try {
            const updated = await request(`${API_URL}/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        } catch {
            setError("Couldn't move the quest. Try again.");
        }
    }

    async function deleteTask(id) {
        try {
            await request(`${API_URL}/tasks/${id}`, { method: "DELETE" });
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch {
            setError("Couldn't delete the quest. Try again.");
        }
    }

    return (
        <section className="quests" aria-labelledby="quests-title">
            <div className="quests__head">
                <h2 id="quests-title" className="quests__title chromatic">Quest Board</h2>
                <span className="kana" aria-hidden="true">クエスト</span>
            </div>

            <form className="quests__form" onSubmit={addTask}>
                <label htmlFor="new-quest" className="sr-only">New quest</label>
                <input
                    id="new-quest"
                    type="text"
                    placeholder={userId ? "New quest..." : "Log in to add quests"}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={!userId}
                />
                <Button type="submit" variant="primary" label="Add quest" disabled={!userId || !newTitle.trim()} />
            </form>

            <p className="quests__error" role="status" aria-live="polite">{error}</p>

            <div className="quests__columns">
                {COLUMNS.map((col) => {
                    const items = tasks.filter((t) => t.status === col.key);
                    return (
                        <div className={`quest-col quest-col--${col.key} chamfer`} key={col.key}>
                            <div className="quest-col__head">
                                <h3 className="hud-label">{col.label}</h3>
                                <span className="quest-col__count">{String(items.length).padStart(2, "0")}</span>
                            </div>

                            {items.length === 0 && (
                                <p className="quest-col__empty">
                                    {col.key === "todo" ? "No quests yet. Add one above." : "Nothing here."}
                                </p>
                            )}

                            <ul className="quest-col__list">
                                {items.map((task) => (
                                    <li className="quest" key={task.id}>
                                        <span className="quest__title">{task.title}</span>
                                        <div className="quest__actions">
                                            {PREV[col.key] && (
                                                <button
                                                    type="button"
                                                    className="quest__btn"
                                                    onClick={() => moveTask(task.id, "prev")}
                                                    aria-label={`Move "${task.title}" back`}
                                                >
                                                    ←
                                                </button>
                                            )}
                                            {NEXT[col.key] && (
                                                <button
                                                    type="button"
                                                    className="quest__btn"
                                                    onClick={() => moveTask(task.id, "next")}
                                                    aria-label={`Move "${task.title}" forward`}
                                                >
                                                    →
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="quest__btn quest__btn--delete"
                                                onClick={() => deleteTask(task.id)}
                                                aria-label={`Delete "${task.title}"`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default TaskBoard;
