import { useEffect, useRef, useState } from "react";
import { formatTimeHours } from "../utils/formatTimeHours";
import Button from "../components/Button";
import "../styles/PomodoroTimer.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SESSION_SECONDS = 60 * 60;
const TICKS = 60;
const SEGMENTS = 24;
const SIZE = 360;
const C = SIZE / 2;
const ARC_R = 116;
const ARC_LEN = 2 * Math.PI * ARC_R;

const STATE = {
  ready:   { label: "Standby",          pill: "Idle" },
  running: { label: "Focusing",         pill: "Active" },
  paused:  { label: "Paused",           pill: "Hold" },
  done:    { label: "Session complete", pill: "Done" },
};

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
};

function PomodoroTimer({ userId }) {
  const [seconds, setSeconds] = useState(SESSION_SECONDS);
  const [isRunning, setRunning] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const startedAtRef = useRef(null);

  async function saveSession() {
    if (!userId || !startedAtRef.current) return;
    const endedAt = new Date().toISOString();
    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_type: "work",
          started_at: startedAtRef.current,
          ended_at: endedAt,
          duration_seconds: SESSION_SECONDS,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSavedMessage("Session saved.");
    } catch {
      setSavedMessage("Couldn't save the session. Check that the backend is running.");
    }
    startedAtRef.current = null;
  }

  // Count down once per second while running; never go below zero
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Stop and save automatically when the session ends
  useEffect(() => {
    if (seconds !== 0) return;
    setRunning(false);
    saveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const state =
    seconds === 0 ? "done"
    : isRunning ? "running"
    : seconds < SESSION_SECONDS ? "paused"
    : "ready";

  // Show the countdown in the browser tab during a session
  useEffect(() => {
    const original = document.title;
    if (state === "running" || state === "paused") {
      document.title = `${formatTimeHours(seconds)} | Overclock`;
    }
    return () => { document.title = original; };
  }, [seconds, state]);

  function reset() {
    setRunning(false);
    setSeconds(SESSION_SECONDS);
    startedAtRef.current = null;
    setSavedMessage("");
  }

  function handleAction() {
    if (state === "done") {
      setSeconds(SESSION_SECONDS);
      setSavedMessage("");
      startedAtRef.current = new Date().toISOString();
      setRunning(true);
      return;
    }
    if (!isRunning && startedAtRef.current === null) {
      startedAtRef.current = new Date().toISOString();
    }
    setRunning((prev) => !prev);
  }

  const fraction = seconds / SESSION_SECONDS;
  const elapsed = SESSION_SECONDS - seconds;
  const progress = Math.round((elapsed / SESSION_SECONDS) * 100);
  // Elapsed minutes go dark starting at 12 o'clock, moving clockwise
  const darkTicks = TICKS - Math.ceil(fraction * TICKS);
  const filledSegments = Math.round((elapsed / SESSION_SECONDS) * SEGMENTS);

  const actionLabel = {
    ready: "Start",
    running: "Pause",
    paused: "Resume",
    done: "Start again",
  }[state];

  return (
    <section className={`timer timer--${state}`} aria-label="Focus timer">
      {/* ===== Left HUD: session data ===== */}
      <aside className="hud-panel hud-panel--left chamfer">
        <div className="hud-panel__head">
          <span className="hud-label">Session</span>
          <span className="hud-panel__code">FCS-01</span>
        </div>

        <div className="meter">
          <div className="meter__row">
            <span className="hud-label">Progress</span>
            <span className="meter__value">{progress}%</span>
          </div>
          <div className="meter__bar" aria-hidden="true">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span key={i} className={i < filledSegments ? "seg seg--on" : "seg"} />
            ))}
          </div>
        </div>

        <dl className="readouts">
          <div>
            <dt className="hud-label">Length</dt>
            <dd>{formatTimeHours(SESSION_SECONDS)}</dd>
          </div>
          <div>
            <dt className="hud-label">Elapsed</dt>
            <dd>{formatTimeHours(elapsed)}</dd>
          </div>
        </dl>
      </aside>

      {/* ===== Dial ===== */}
      <div className="timer__center">
        <div className="timer__dial">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
            {/* Minute ticks: one per remaining minute stays lit */}
            {Array.from({ length: TICKS }, (_, i) => {
              const major = i % 5 === 0;
              const [x1, y1] = polar(major ? 136 : 143, i * 6);
              const [x2, y2] = polar(152, i * 6);
              return (
                <line
                  key={i}
                  className={i >= darkTicks ? "tick tick--lit" : "tick"}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                />
              );
            })}

            {/* Minute scale labels */}
            {[0, 15, 30, 45].map((m) => {
              const [x, y] = polar(168, m * 6);
              return (
                <text key={m} x={x} y={y} className="scale-label" textAnchor="middle" dominantBaseline="central">
                  {String(m).padStart(2, "0")}
                </text>
              );
            })}

            {/* Crosshairs on the diagonals */}
            {[45, 135, 225, 315].map((deg) => {
              const [x, y] = polar(166, deg);
              return (
                <g key={deg} className="crosshair">
                  <line x1={x - 6} y1={y} x2={x + 6} y2={y} />
                  <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
                </g>
              );
            })}

            {/* Rotating dashed ring (spins only while running) */}
            <circle className="ring-spin" cx={C} cy={C} r={127} />

            {/* Progress ring: drains clockwise as time passes */}
            <circle className="ring-track" cx={C} cy={C} r={ARC_R} />
            <circle
              className="ring-progress"
              cx={C}
              cy={C}
              r={ARC_R}
              strokeDasharray={ARC_LEN}
              strokeDashoffset={-ARC_LEN * (1 - fraction)}
              transform={`rotate(-90 ${C} ${C})`}
            />
          </svg>

          <div className="timer__readout">
            <span className="kana" aria-hidden="true">集中</span>
            <span id="timer" className="timer__digits" role="timer" aria-live="off">
              {formatTimeHours(seconds)}
            </span>
            <span className="timer__state hud-label">{STATE[state].label}</span>
          </div>
        </div>

        <div className="timer__actions">
          <Button
            label={actionLabel}
            variant={state === "running" ? "active" : "primary"}
            onClick={handleAction}
          />
          <Button label="Reset" variant="ghost" onClick={reset} disabled={state === "ready"} />
        </div>

        <p className="timer__saved" role="status" aria-live="polite">{savedMessage}</p>
      </div>

      {/* ===== Right HUD: status ===== */}
      <aside className="hud-panel hud-panel--right chamfer">
        <div className="hud-panel__head">
          <span className="hud-label">Status</span>
          <span className={`pill pill--${state}`}>
            <span className="pill__dot" />
            {STATE[state].pill}
          </span>
        </div>

        <p className="hud-panel__vertical kana" aria-hidden="true">
          {[..."集中モード"].map((ch, i) => <span key={i}>{ch}</span>)}
        </p>

        <div className="hud-panel__foot">
          <div className="barcode" aria-hidden="true" />
          <span className="hud-panel__code">OVC / 0001</span>
        </div>
      </aside>
    </section>
  );
}

export default PomodoroTimer;
