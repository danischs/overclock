import "../styles/Wordmark.css";
import mark from "../assets/overclock-mark.png";

export default function Wordmark({ size = "sm", showMark = true }) {
  return (
    <span className={`wordmark wordmark--${size}`} aria-label="Overclock">
      {showMark && <img src={mark} alt="" className="wordmark__mark" aria-hidden="true" />}
      <span className="wordmark__text chromatic">
        OVER<span className="wordmark__up">CLOCK</span>
      </span>
    </span>
  );
}
