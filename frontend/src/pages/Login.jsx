import Footer from "../components/Footer";
import "../styles/Login.css";
import LevelUpLogo from "../assets/LevelUpLogo.png"
import Button from "../components/Button"
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function Login() {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSignUp(e) {
    e.preventDefault();
    const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    console.log(data);
  }

  async function handleLogin(e){
    e.preventDefault();
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })      
    });
    const data = await response.json()

    if (data.accessAllowed == true){
      navigate("/home");
    }
  }



  return (
    <>
      <div className="login-wrapper">
        <div className="login-content">
          
  

          <div className="login-container">
            <img
            src={LevelUpLogo}
            alt="Level Up Logo"
            className="login-logo"
            />
            <form>
              <div className="login-option">
                <label htmlFor="username">Enter username</label>
                <input
                  type="text"
                  id="username"
                  onChange={(e) => setUsername(e.target.value)}
                  name="username"
                  required
                  minLength={5}
                  maxLength={25}
                />
              </div>

              <div className="login-option">
                <label htmlFor="password">Enter password</label>
                <input
                  type="password"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  required
                  minLength={8}
                  maxLength={30}
                />
              </div>
              <div className="login-buttons">
                <Button label="Login" onClick = {(e) => handleLogin(e)} />
                <Button label="Sign Up" onClick = {(e) => handleSignUp(e)} />
              </div>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}