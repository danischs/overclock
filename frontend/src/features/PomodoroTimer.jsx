import { useEffect, useRef, useState } from "react";
import { formatTimeHours } from "../utils/formatTimeHours";
import Button from "../components/Button";
import "../styles/PomodoroTimer.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PRESETS = [
  { label: "25 / 5",  work: 25 * 60, brk:  5 * 60 },
  { label: "50 / 10", work: 50 * 60, brk: 10 * 60 },
  { label: "Custom",  work: null,    brk:  null     },
];

const TICKS = 60;
const SEGMENTS = 24;
const SIZE = 360;
const C = SIZE / 2;
const ARC_R = 116;
const ARC_LEN = 2 * Math.PI * ARC_R;

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
};

const clampCustom = (val, min, max) => Math.min(max, Math.max(min, Math.round(Number(val)) || min));

function PomodoroTimer({ userId }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [phase, setPhase] = useState("work");
  const [customWork, setCustomWork] = useState(25);       // input display value
  const [customBreak, setCustomBreak] = useState(5);
  const [committedWork, setCommittedWork] = useState(25); // value the timer actually uses
  const [committedBreak, setCommittedBreak] = useState(5);
  const [seconds, setSeconds] = useState(PRESETS[0].work);
  const [isRunning, setRunning] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const startedAtRef = useRef(null);
  // Ref mirrors phase so the seconds=0 effect always reads the current value
  const phaseRef = useRef("work");
  const presetIdxRef = useRef(0);

  const preset = PRESETS[presetIdx];
  const effectivePreset = {
    work: preset.work ?? committedWork * 60,
    brk:  preset.brk  ?? committedBreak * 60,
  };
  const effectiveWorkRef = useRef(effectivePreset.work);
  const effectiveBrkRef  = useRef(effectivePreset.brk);
  useEffect(() => {
    effectiveWorkRef.current = effectivePreset.work;
    effectiveBrkRef.current  = effectivePreset.brk;
  });

  const totalSeconds = phase === "work" ? effectivePreset.work : effectivePreset.brk;

  async function saveSession(workSeconds) {
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
          duration_seconds: workSeconds,
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

  // Handle phase transitions when the countdown hits zero
  useEffect(() => {
    if (seconds !== 0) return;
    if (phaseRef.current === "work") {
      saveSession(effectiveWorkRef.current);
      if (effectiveBrkRef.current > 0) {
        phaseRef.current = "break";
        setPhase("break");
        setSeconds(effectiveBrkRef.current);
        // stay running — break starts automatically
      } else {
        setRunning(false);
      }
    } else {
      // break finished
      setRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const state =
    seconds === 0 ? "done"
    : isRunning ? "running"
    : seconds < totalSeconds ? "paused"
    : "ready";

  const stateLabel = {
    ready:   phase === "break" ? "Break ready"   : "Standby",
    running: phase === "break" ? "On break"      : "Focusing",
    paused:  phase === "break" ? "Break paused"  : "Paused",
    done:    "Session complete",
  }[state];

  const pill = {
    ready:   "Idle",
    running: phase === "break" ? "Break" : "Active",
    paused:  "Hold",
    done:    "Done",
  }[state];

  const kana = phase === "break" ? "休憩" : "集中";
  const kanaFull = phase === "break" ? "休憩モード" : "集中モード";

  // Show the countdown in the browser tab during a session
  useEffect(() => {
    const original = document.title;
    if (state === "running" || state === "paused") {
      document.title = `${formatTimeHours(seconds)} | Overclock`;
    }
    return () => { document.title = original; };
  }, [seconds, state]);

  function selectPreset(idx) {
    phaseRef.current = "work";
    presetIdxRef.current = idx;
    setPresetIdx(idx);
    setPhase("work");
    const p = PRESETS[idx];
    setSeconds(p.work ?? committedWork * 60);
    setRunning(false);
    startedAtRef.current = null;
    setSavedMessage("");
  }

  function reset() {
    phaseRef.current = "work";
    setPhase("work");
    setRunning(false);
    setSeconds(effectivePreset.work);
    startedAtRef.current = null;
    setSavedMessage("");
  }

  function handleAction() {
    if (state === "done") {
      phaseRef.current = "work";
      setPhase("work");
      setSeconds(effectivePreset.work);
      setSavedMessage("");
      startedAtRef.current = new Date().toISOString();
      setRunning(true);
      return;
    }
    if (!isRunning && startedAtRef.current === null && phaseRef.current === "work") {
      startedAtRef.current = new Date().toISOString();
    }
    setRunning((prev) => !prev);
  }

  const fraction = seconds / totalSeconds;
  const elapsed = totalSeconds - seconds;
  const progress = Math.round((elapsed / totalSeconds) * 100);
  const darkTicks = TICKS - Math.ceil(fraction * TICKS);
  const filledSegments = Math.round((elapsed / totalSeconds) * SEGMENTS);

  const actionLabel = {
    ready: "Start",
    running: "Pause",
    paused: "Resume",
    done: "Start again",
  }[state];

  const canChangePreset = state === "ready" || state === "done";

  return (
    <section className={`timer timer--${state} timer--${phase}`} aria-label="Focus timer">
      {/* ===== Left HUD: session data ===== */}
      <aside className="hud-panel hud-panel--left chamfer">
        <div className="hud-panel__head">
          <span className="hud-label">Session</span>
          <span className="hud-panel__code">FCS-01</span>
        </div>

        <div className="preset-group">
          <span className="hud-label">Preset</span>
          <div className="preset-btns">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                className={`preset-btn${presetIdx === i ? " preset-btn--active" : ""}`}
                onClick={() => selectPreset(i)}
                disabled={!canChangePreset}
                aria-pressed={presetIdx === i}
              >
                {p.label}
              </button>
            ))}
          </div>
          {presetIdx === 2 && (
            <div className="custom-inputs">
              <label className="custom-field">
                <span className="hud-label">Work</span>
                <input
                  className="custom-input"
                  type="number"
                  min={1}
                  max={120}
                  value={customWork}
                  disabled={!canChangePreset}
                  onChange={(e) => setCustomWork(Number(e.target.value))}
                  onBlur={(e) => {
                    const v = clampCustom(e.target.value, 1, 120);
                    setCustomWork(v);
                    setCommittedWork(v);
                    if (!isRunning && startedAtRef.current === null && phase === "work") {
                      setSeconds(v * 60);
                    }
                  }}
                />
                <span className="hud-label">min</span>
              </label>
              <label className="custom-field">
                <span className="hud-label">Break</span>
                <input
                  className="custom-input"
                  type="number"
                  min={0}
                  max={60}
                  value={customBreak}
                  disabled={!canChangePreset}
                  onChange={(e) => setCustomBreak(Number(e.target.value))}
                  onBlur={(e) => {
                    const v = clampCustom(e.target.value, 0, 60);
                    setCustomBreak(v);
                    setCommittedBreak(v);
                    if (!isRunning && startedAtRef.current === null && phase === "break") {
                      setSeconds(v * 60);
                    }
                  }}
                />
                <span className="hud-label">min</span>
              </label>
            </div>
          )}
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
            <dt className="hud-label">Phase</dt>
            <dd>{phase === "work" ? "Work" : "Break"}</dd>
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
            {/* Minute ticks */}
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
            <span className="kana" aria-hidden="true">{kana}</span>
            <span id="timer" className="timer__digits" role="timer" aria-live="off">
              {formatTimeHours(seconds)}
            </span>
            <span className="timer__state hud-label">{stateLabel}</span>
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
            {pill}
          </span>
        </div>

        <p className="hud-panel__vertical kana" aria-hidden="true">
          {[...kanaFull].map((ch, i) => <span key={i}>{ch}</span>)}
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
