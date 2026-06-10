import './BackButton.css'

export default function BackButton({ onClick, label = 'Back' }) {
  return (
    <button className="global-back-btn" onClick={onClick} aria-label="Go back">
      <span className="global-back-arrow">‹</span>
      <span className="global-back-label">{label}</span>
    </button>
  )
}
