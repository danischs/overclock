import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <p className="footer-text">
        <span className="rune">᛫</span>
        App by Danisch Nazir Saikhu — {new Date().getFullYear()}
        <span className="rune">᛫</span>
      </p>
    </footer>
  );
}

export default Footer;