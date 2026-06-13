import './BackButton.css'
import { useLanguage } from './LanguageContext'
import T from './translations'

export default function BackButton({ onClick, labelKey }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const label = labelKey ? t[labelKey] : t.back
  return (
    <button className="global-back-btn" onClick={onClick} aria-label={label}>
      <span className="global-back-arrow">‹</span>
      <span className="global-back-label">{label}</span>
    </button>
  )
}
