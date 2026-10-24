import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Button from "../components/Button";
import GridFloor from "../components/GridFloor";
import Wordmark from "../components/Wordmark";
import fullLogo from "../assets/overclock-full.png";
import "../styles/Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function Login({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ tone: "idle", text: "" });
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  async function post(path) {
    const response = await fetch(`${API_URL}/users/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await post("login");
      if (data.accessAllowed) {
        setUserId(data.userId);
        navigate("/home");
      } else {
        setStatus({ tone: "error", text: "Wrong username or password." });
      }
    } catch {
      setStatus({ tone: "error", text: "Can't reach the server. Check that the backend is running." });
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp() {
    // Sign up isn't the form's submit button, so run validation manually
    if (!formRef.current.reportValidity()) return;
    setBusy(true);
    try {
      await post("signup");
      setStatus({ tone: "ok", text: "Account created. Log in to continue." });
    } catch {
      setStatus({ tone: "error", text: "Couldn't create the account. Try a different username." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="login">
        <GridFloor className="login__floor" />
        <div className="login__boot">
        <section className="login__panel chamfer" aria-labelledby="login-title">
          <div className="tape" aria-hidden="true" />
          <div className="login__bar">
            <span className="hud-label">Access terminal</span>
            <span className="kana" aria-hidden="true">ログイン</span>
          </div>
          <img src={fullLogo} alt="" className="login__logo" aria-hidden="true" />
          <Wordmark size="lg" showMark={false} />
          <h1 id="login-title" className="login__title">
            Log in to start a focus session.
          </h1>

          <form ref={formRef} className="login__form" onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="username" className="hud-label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                minLength={5}
                maxLength={25}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password" className="hud-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={30}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <p className={`login__status login__status--${status.tone}`} role="status" aria-live="polite">
              {status.text}
            </p>

            <div className="login__actions">
              <Button type="submit" variant="primary" label="Log in" disabled={busy} />
              <Button type="button" variant="ghost" label="Create account" onClick={handleSignUp} disabled={busy} />
            </div>
          </form>

          <div className="login__foot" aria-hidden="true">
            <div className="barcode" />
            <span className="login__code">AUTH / NODE-07</span>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
