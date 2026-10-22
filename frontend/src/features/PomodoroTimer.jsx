import { useState, useEffect, useRef } from "react";
import { formatTimeHours } from "../utils/formatTimeHours";
import '../styles/PomodoroTimer.css';
import Button from "../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PomodoroTimer({ userId }) {
    const [seconds, setSeconds] = useState(60 * 60);
    const [isRunning, setRunning] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");
    const startedAtRef = useRef(null);

    function reset() {
        setRunning(false);
        setSeconds(60 * 60);
        startedAtRef.current = null;
        setSavedMessage("");
    }

    function handleStartPause() {
        if (!isRunning && seconds > 0) {
            if (startedAtRef.current === null) {
                startedAtRef.current = new Date().toISOString();
            }
            setRunning(true);
        } else {
            setRunning(false);
        }
    }

    async function saveSession() {
        if (!userId || !startedAtRef.current) return;
        const endedAt = new Date().toISOString();
        const duration = 60 * 60 - seconds;
        try {
            await fetch(`${API_URL}/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    session_type: "work",
                    started_at: startedAtRef.current,
                    ended_at: endedAt,
                    duration_seconds: duration,
                }),
            });
            setSavedMessage("Session saved!");
        } catch {
            setSavedMessage("Failed to save session.");
        }
    }

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        if (seconds === 0) {
            saveSession();
        }
    }, [seconds]);

    return (
        <section className="timer-shell">
            <div className="timer-card">
                <h3 id="timer">{formatTimeHours(seconds)}</h3>
                {savedMessage && <p className="session-saved-msg">{savedMessage}</p>}
                <div className="timer-actions">
                    <Button
                        id="action-btn"
                        onClick={handleStartPause}
                        label={isRunning ? "Pause" : "Start"}
                        disabled={seconds === 0}
                    />
                    <Button id="reset-btn" onClick={reset} label="Reset" />
                </div>
            </div>
        </section>
    );
}

export default PomodoroTimer;
