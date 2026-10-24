import { useEffect, useState } from "react";
import "../styles/Header.css";
import Wordmark from "./Wordmark";

const NAV = [
  { label: "Focus", href: "#/home", active: true },
  { label: "Stats" },
  { label: "Settings" },
  { label: "About" },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad = (n) => String(n).padStart(2, "0");

function Header() {
  const now = useClock();
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const date = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <a href="#/home" className="app-header__brand">
          <Wordmark />
          <span className="kana app-header__kana" aria-hidden="true">オーバークロック</span>
        </a>

        <nav aria-label="Main">
          <ul className="app-nav">
            {NAV.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={item.active ? "is-active" : undefined}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="app-nav__soon" title="Coming soon">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="app-header__clock" aria-label="Current time">
          <span className="app-header__time">{time}</span>
          <span className="hud-label">{date}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
