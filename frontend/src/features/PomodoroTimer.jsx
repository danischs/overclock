import { useState, useEffect } from "react";
import { formatTimeHours } from "../utils/formatTimeHours";
import '../styles/PomodoroTimer.css';
import Button from "../components/Button";


function PomodoroTimer(){

    function reset(){
        setRunning(() => false);
        setSeconds(() => 60*60);
    }
    let [seconds, setSeconds] = useState(60*60);
    let [isRunning, setRunning] = useState(false);

    useEffect(() => {
        if (!isRunning){
            return;
        }
        const interval = setInterval(() => {
            setSeconds((previousSeconds) => previousSeconds - 1);
        }, 1000);
    
        return() => clearInterval(interval);

    }, [isRunning]);

    return (
    <section className="timer-shell">
        <div className="timer-card">
        <h3 id="timer">{formatTimeHours(seconds)}</h3>

        <div className="timer-actions">
        <Button
            id="action-btn"
            onClick={() => setRunning(prev => !prev)}
            label={seconds == 0 ? "Reset" : isRunning ? "Pause" : "Start"}
        />

        <Button id="reset-btn" onClick={reset} label="Reset" />
        </div>
        </div>
    </section>
    );
};


export default PomodoroTimer;
