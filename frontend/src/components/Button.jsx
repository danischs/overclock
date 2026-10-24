import "../styles/Button.css";

/**
 * variant: "primary" (filled ink) | "ghost" (outline) | "active" (signal outline)
 */
export default function Button({
  label,
  onClick,
  type = "button",
  variant = "ghost",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant}`}
    >
      {label}
    </button>
  );
}
